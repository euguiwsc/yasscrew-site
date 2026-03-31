/* ========================================
   YASSCREW — Customizer 3D JavaScript
   Full interactive design tool + 3D viewer
   ======================================== */

// ─── STATE ───────────────────────────────
const state = {
  currentStep: 1,
  selectedPiece: 'tshirt',
  selectedSize: 'M',
  baseColor: '#1a1a1a',
  layers: [],
  selectedLayer: null,
  currentTool: 'select',
  currentView: 'front',
  autoRotate: false,
  wireframe: false,
  quantity: 1,
  rotation: 0,
  history: [],
  redoStack: [],
  savedDesigns: JSON.parse(localStorage.getItem('yasscrew_designs') || '[]')
};

const prices = {
  tshirt: 89.90,
  hoodie: 139.90,
  jacket: 189.90,
  cap: 59.90,
  pants: 119.90,
  shorts: 79.90
};

const pieceNames = {
  tshirt: 'Camiseta',
  hoodie: 'Moletom',
  jacket: 'Jaqueta',
  cap: 'Boné',
  pants: 'Calça',
  shorts: 'Shorts'
};

// ─── INIT ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadSavedDesigns();
  updateSummary();
  initDragDrop();
  initThreeJS();
});

// ─── THREE.JS 3D ENGINE ───────────────────
let threeRenderer, threeScene, threeCamera, threeMesh, threeAnimId;
let isThreeReady = false;

function initThreeJS() {
  if (typeof THREE === 'undefined') {
    console.log('Three.js not available, using CSS 3D');
    initCSS3DFallback();
    return;
  }

  try {
    const viewport = document.getElementById('canvasViewport');
    if (!viewport) return;

    const container = document.getElementById('modelViewerContainer');
    if (!container) return;

    // Create scene
    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    threeCamera.position.set(0, 0, 3.5);

    // Renderer
    threeRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: document.getElementById('designCanvas')
    });
    threeRenderer.setSize(500, 600);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeRenderer.shadowMap.enabled = true;
    threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Make canvas visible
    const canvas = document.getElementById('designCanvas');
    if (canvas) {
      canvas.style.opacity = '1';
      canvas.style.position = 'relative';
      canvas.style.zIndex = '2';
      canvas.width = 500;
      canvas.height = 600;
    }

    // Hide CSS 3D model
    const cssModel = document.getElementById('model3dWrapper');
    if (cssModel) cssModel.style.display = 'none';

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    threeScene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(2, 3, 4);
    dirLight.castShadow = true;
    threeScene.add(dirLight);

    const redLight = new THREE.PointLight(0xE63946, 0.8, 8);
    redLight.position.set(-3, 1, 2);
    threeScene.add(redLight);

    const backLight = new THREE.DirectionalLight(0x4466ff, 0.3);
    backLight.position.set(-2, -1, -3);
    threeScene.add(backLight);

    // Create T-Shirt geometry using custom shape
    createTShirt3D();

    isThreeReady = true;

    // Mouse interaction
    let isDragging = false;
    let prevMouseX = 0, prevMouseY = 0;
    let rotX = 0.1, rotY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    document.addEventListener('mouseup', () => { isDragging = false; });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging || !threeMesh) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      rotY += deltaX * 0.01;
      rotX += deltaY * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    // Animate
    function animateThree() {
      threeAnimId = requestAnimationFrame(animateThree);
      if (threeMesh) {
        if (state.autoRotate) {
          threeMesh.rotation.y += 0.008;
        } else {
          threeMesh.rotation.y += (rotY - threeMesh.rotation.y) * 0.08;
          threeMesh.rotation.x += (rotX - threeMesh.rotation.x) * 0.08;
        }
        // Float animation
        threeMesh.position.y = Math.sin(Date.now() * 0.001) * 0.1;
      }
      if (threeRenderer && threeScene && threeCamera) {
        threeRenderer.render(threeScene, threeCamera);
      }
    }
    animateThree();

  } catch(e) {
    console.warn('Three.js init failed:', e);
    initCSS3DFallback();
  }
}

function createTShirt3D() {
  if (!threeScene) return;

  // Remove existing mesh
  if (threeMesh) {
    threeScene.remove(threeMesh);
    threeMesh = null;
  }

  const group = new THREE.Group();

  // T-shirt body (main)
  const bodyGeo = new THREE.BoxGeometry(1.6, 2.2, 0.08);
  // Round the body a bit
  const bodyMat = new THREE.MeshLambertMaterial({
    color: new THREE.Color(state.baseColor),
    side: THREE.DoubleSide
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = -0.1;
  group.add(body);

  // Sleeves
  const sleeveGeo = new THREE.BoxGeometry(0.6, 0.8, 0.07);
  const sleeveMat = new THREE.MeshLambertMaterial({
    color: new THREE.Color(state.baseColor),
    side: THREE.DoubleSide
  });

  const sleeveL = new THREE.Mesh(sleeveGeo, sleeveMat);
  sleeveL.position.set(-1.1, 0.8, 0);
  sleeveL.rotation.z = 0.3;
  group.add(sleeveL);

  const sleeveR = new THREE.Mesh(sleeveGeo, sleeveMat);
  sleeveR.position.set(1.1, 0.8, 0);
  sleeveR.rotation.z = -0.3;
  group.add(sleeveR);

  // Collar
  const collarGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 32, Math.PI);
  const collarMat = new THREE.MeshLambertMaterial({
    color: new THREE.Color(state.baseColor).multiplyScalar(0.7)
  });
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.position.y = 1.0;
  collar.rotation.z = Math.PI;
  group.add(collar);

  // Design text on shirt
  addTextToShirt(group);

  group.scale.set(0.85, 0.85, 0.85);
  threeScene.add(group);
  threeMesh = group;
}

function addTextToShirt(group) {
  // Create a canvas texture for the shirt design
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 512;
  texCanvas.height = 512;
  const ctx = texCanvas.getContext('2d');

  // Background
  ctx.fillStyle = state.baseColor;
  ctx.fillRect(0, 0, 512, 512);

  // Render layers onto texture
  state.layers.forEach(layer => {
    ctx.save();
    ctx.globalAlpha = (layer.opacity || 100) / 100;
    const x = (layer.x / 300) * 512;
    const y = (layer.y / 320) * 512;
    ctx.translate(x, y);
    ctx.rotate((layer.rotation || 0) * Math.PI / 180);
    const scale = (layer.scale || 100) / 100;
    ctx.scale(scale, scale);

    if (layer.type === 'text') {
      ctx.font = `${layer.size}px "${layer.fontFamily || 'Bebas Neue'}"`;
      ctx.fillStyle = layer.color || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(layer.content, 0, 0);
    } else if (layer.type === 'shape') {
      ctx.font = `${layer.size}px FontAwesome`;
      ctx.fillStyle = layer.color || '#E63946';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(layer.emoji || '★', 0, 0);
    } else if (layer.type === 'image' && layer.img) {
      const size = layer.size || 80;
      ctx.drawImage(layer.img, -size/2, -size/2, size, size);
    }
    ctx.restore();
  });

  // Create texture
  const texture = new THREE.CanvasTexture(texCanvas);

  // Apply to front face of shirt body
  if (threeMesh && threeMesh.children[0]) {
    threeMesh.children[0].material.map = texture;
    threeMesh.children[0].material.needsUpdate = true;
  }
}

function initCSS3DFallback() {
  // Keep CSS 3D model, just make it more interactive
  const garment = document.getElementById('garment3d');
  if (!garment) return;

  let isDragging = false;
  let prevX = 0;
  let currentRot = 0;

  const viewport = document.getElementById('canvasViewport');
  if (!viewport) return;

  viewport.addEventListener('mousedown', e => {
    isDragging = true;
    prevX = e.clientX;
    garment.style.animation = 'none';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    garment.style.animation = 'garmentFloatAnim 5s ease-in-out infinite';
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const delta = e.clientX - prevX;
    currentRot += delta * 0.8;
    prevX = e.clientX;
    garment.style.transform = `rotateY(${currentRot}deg)`;
  });
}

// ─── STEP NAVIGATION ─────────────────────
const stepLabels = [
  'Passo 1 de 4 — Escolha a Peça',
  'Passo 2 de 4 — Design & Cores',
  'Passo 3 de 4 — Visualização 3D',
  'Passo 4 de 4 — Finalizar Pedido'
];

function navigateStep(direction) {
  const newStep = state.currentStep + direction;
  if (newStep < 1 || newStep > 4) return;

  // Mark current step as done
  document.querySelectorAll('.step-item').forEach((item, i) => {
    item.classList.remove('active', 'done');
    if (i + 1 < newStep) item.classList.add('done');
    if (i + 1 === newStep) item.classList.add('active');
  });

  // Show/hide tool sections
  document.querySelectorAll('.tool-section').forEach((section, i) => {
    section.style.display = i + 1 === newStep ? 'block' : 'none';
  });

  state.currentStep = newStep;

  // Update bottom bar
  const label = document.getElementById('currentStepLabel');
  if (label) label.textContent = stepLabels[newStep - 1];

  const prevBtn = document.getElementById('prevStepBtn');
  const nextBtn = document.getElementById('nextStepBtn');

  if (prevBtn) prevBtn.disabled = newStep === 1;
  if (nextBtn) {
    if (newStep === 4) {
      nextBtn.innerHTML = '<i class="fas fa-check"></i> Concluído';
      nextBtn.onclick = () => submitOrder();
    } else {
      nextBtn.innerHTML = 'Próximo <i class="fas fa-arrow-right"></i>';
      nextBtn.onclick = () => navigateStep(1);
    }
  }

  // If step 3, refresh 3D
  if (newStep === 3 && isThreeReady && threeMesh) {
    updateShirt3DTexture();
  }

  // Update summary
  updateSummary();
}

// Init: hide steps 2-4 initially
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tool-section').forEach((section, i) => {
    if (i > 0) section.style.display = 'none';
  });
});

// ─── PIECE SELECTION ──────────────────────
function selectPiece(piece, btn) {
  state.selectedPiece = piece;
  document.querySelectorAll('.piece-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Update 3D model
  updateGarmentSVG(piece);
  updateSummary();
}

function updateGarmentSVG(piece) {
  const garmentShape = document.getElementById('garmentShape');
  const svgBase = document.getElementById('svgBase');

  if (!garmentShape) return;

  const shapeClasses = { tshirt: 'tshirt', hoodie: 'hoodie', jacket: 'jacket', cap: 'cap', pants: 'pants', shorts: 'shorts' };
  garmentShape.className = 'garment-shape ' + (shapeClasses[piece] || 'tshirt');

  // If Three.js is ready, recreate model
  if (isThreeReady) {
    createTShirt3D();
  } else {
    // Update CSS SVG color
    if (svgBase) svgBase.setAttribute('fill', state.baseColor);
  }
}

// ─── SIZE SELECTION ───────────────────────
function selectSize(size, btn) {
  state.selectedSize = size;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  updateSummary();
}

// ─── BASE COLOR ───────────────────────────
function setBaseColor(color, btn) {
  state.baseColor = color;

  // Update SVG base
  const svgBase = document.getElementById('svgBase');
  const svgBaseBack = document.getElementById('svgBaseBack');
  if (svgBase) svgBase.setAttribute('fill', color);
  if (svgBaseBack) svgBaseBack.setAttribute('fill', color);

  // Update Three.js model
  if (isThreeReady && threeMesh) {
    threeMesh.children.forEach(child => {
      if (child.material) {
        child.material.color.set(color);
      }
    });
    updateShirt3DTexture();
  }

  // Update CSS fallback
  const tshirtMain = document.getElementById('previewShirt');
  if (tshirtMain) tshirtMain.style.background = color;

  // Palette active state
  document.querySelectorAll('#baseColors .color-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  updateSummary();
}

// ─── ADD TEXT LAYER ───────────────────────
function addTextLayer() {
  const input = document.getElementById('textInput');
  const fontSelect = document.getElementById('fontSelect');
  const textColor = document.getElementById('textColor');
  const textSize = document.getElementById('textSize');

  const text = input ? input.value.trim() : '';
  if (!text) {
    if (input) {
      input.style.borderColor = '#E63946';
      setTimeout(() => input.style.borderColor = '', 1000);
    }
    return;
  }

  saveToHistory();

  const layer = {
    id: Date.now(),
    type: 'text',
    content: text,
    fontFamily: fontSelect ? fontSelect.value : 'Bebas Neue',
    color: textColor ? textColor.value : '#ffffff',
    size: textSize ? parseInt(textSize.value) : 32,
    x: 150,
    y: 160,
    rotation: 0,
    opacity: 100,
    scale: 100
  };

  state.layers.push(layer);
  if (input) input.value = '';

  updateSVGDesign();
  renderLayers();
  updateShirt3DTexture();

  showToast('Texto adicionado!');
}

// ─── ADD SHAPE ────────────────────────────
const shapeEmojis = {
  circle: '●',
  square: '■',
  star: '★',
  heart: '♥',
  bolt: '⚡',
  fire: '🔥'
};

const shapeIcons = {
  circle: 'fa-circle',
  square: 'fa-square',
  star: 'fa-star',
  heart: 'fa-heart',
  bolt: 'fa-bolt',
  fire: 'fa-fire'
};

function addShape(type) {
  const shapeColor = document.getElementById('shapeColor');
  const shapeSize = document.getElementById('shapeSize');

  saveToHistory();

  const layer = {
    id: Date.now(),
    type: 'shape',
    shape: type,
    emoji: shapeEmojis[type] || '★',
    icon: shapeIcons[type] || 'fa-star',
    color: shapeColor ? shapeColor.value : '#E63946',
    size: shapeSize ? parseInt(shapeSize.value) : 40,
    x: 150,
    y: 160,
    rotation: 0,
    opacity: 100,
    scale: 100
  };

  state.layers.push(layer);
  updateSVGDesign();
  renderLayers();
  updateShirt3DTexture();
  showToast('Forma adicionada!');
}

// ─── HANDLE IMAGE UPLOAD ──────────────────
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('Arquivo muito grande! Máximo 5MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      saveToHistory();

      const layer = {
        id: Date.now(),
        type: 'image',
        content: file.name.replace(/\.[^.]+$/, ''),
        src: e.target.result,
        img: img,
        size: 80,
        x: 150,
        y: 160,
        rotation: 0,
        opacity: 100,
        scale: 100
      };

      state.layers.push(layer);
      updateSVGDesign();
      renderLayers();
      updateShirt3DTexture();
      showToast('Imagem adicionada!');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ─── ADD LOGO PRESET ──────────────────────
function addLogoPreset(text) {
  saveToHistory();

  const layer = {
    id: Date.now(),
    type: 'text',
    content: text,
    fontFamily: 'Bebas Neue',
    color: '#E63946',
    size: text === '★' ? 48 : 36,
    x: 150,
    y: 160,
    rotation: 0,
    opacity: 100,
    scale: 100
  };

  state.layers.push(layer);
  updateSVGDesign();
  renderLayers();
  updateShirt3DTexture();
  showToast(`"${text}" adicionado!`);
}

// ─── UPDATE TEXT OPTIONS ──────────────────
function updateTextOptions() {
  // No real-time update unless a layer is selected
  if (state.selectedLayer !== null) {
    const layer = state.layers.find(l => l.id === state.selectedLayer);
    if (layer && layer.type === 'text') {
      const fontSelect = document.getElementById('fontSelect');
      const textColor = document.getElementById('textColor');
      const textSize = document.getElementById('textSize');
      if (fontSelect) layer.fontFamily = fontSelect.value;
      if (textColor) layer.color = textColor.value;
      if (textSize) layer.size = parseInt(textSize.value);
      updateSVGDesign();
      updateShirt3DTexture();
    }
  }
}

// ─── SVG DESIGN UPDATE ────────────────────
function updateSVGDesign() {
  const designLayer = document.getElementById('svgDesignLayer');
  if (!designLayer) return;

  designLayer.innerHTML = '';

  state.layers.forEach(layer => {
    const x = (layer.x || 150);
    const y = (layer.y || 160);
    const rot = layer.rotation || 0;
    const scale = (layer.scale || 100) / 100;
    const opacity = (layer.opacity || 100) / 100;

    if (layer.type === 'text') {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', layer.color || '#ffffff');
      text.setAttribute('font-family', layer.fontFamily || 'Bebas Neue');
      text.setAttribute('font-size', (layer.size || 32) * scale);
      text.setAttribute('opacity', opacity);
      text.setAttribute('transform', `rotate(${rot}, ${x}, ${y})`);
      text.textContent = layer.content;
      designLayer.appendChild(text);

    } else if (layer.type === 'shape') {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', layer.color || '#E63946');
      text.setAttribute('font-size', (layer.size || 40) * scale);
      text.setAttribute('opacity', opacity);
      text.setAttribute('transform', `rotate(${rot}, ${x}, ${y})`);
      text.textContent = layer.emoji || '★';
      designLayer.appendChild(text);

    } else if (layer.type === 'image' && layer.src) {
      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      const size = (layer.size || 80) * scale;
      image.setAttribute('x', x - size/2);
      image.setAttribute('y', y - size/2);
      image.setAttribute('width', size);
      image.setAttribute('height', size);
      image.setAttribute('href', layer.src);
      image.setAttribute('opacity', opacity);
      image.setAttribute('transform', `rotate(${rot}, ${x}, ${y})`);
      designLayer.appendChild(image);
    }
  });
}

// ─── UPDATE 3D TEXTURE ────────────────────
function updateShirt3DTexture() {
  if (!isThreeReady || !threeMesh) return;
  addTextToShirt(threeMesh);
}

// ─── RENDER LAYERS LIST ───────────────────
function renderLayers() {
  const list = document.getElementById('layersList');
  if (!list) return;

  if (state.layers.length === 0) {
    list.innerHTML = `
      <div class="layers-empty">
        <i class="fas fa-layer-group"></i>
        <p>Nenhum elemento<br />adicionado ainda</p>
      </div>`;
    return;
  }

  list.innerHTML = '';

  // Render in reverse (top layers first)
  [...state.layers].reverse().forEach((layer, i) => {
    const realIndex = state.layers.length - 1 - i;
    const item = document.createElement('div');
    item.className = 'layer-item' + (layer.id === state.selectedLayer ? ' selected' : '');
    item.dataset.id = layer.id;

    let icon = 'fa-font';
    if (layer.type === 'shape') icon = 'fa-shapes';
    if (layer.type === 'image') icon = 'fa-image';

    item.innerHTML = `
      <div class="layer-icon"><i class="fas ${icon}"></i></div>
      <div class="layer-info">
        <div class="layer-name">${layer.content || layer.shape || 'Imagem'}</div>
        <div class="layer-type">${layer.type}</div>
      </div>
      <div class="layer-actions">
        <button class="layer-action-btn" onclick="moveLayer(${layer.id}, -1)" title="Para cima"><i class="fas fa-chevron-up"></i></button>
        <button class="layer-action-btn" onclick="moveLayer(${layer.id}, 1)" title="Para baixo"><i class="fas fa-chevron-down"></i></button>
        <button class="layer-action-btn delete" onclick="deleteLayer(${layer.id})" title="Deletar"><i class="fas fa-times"></i></button>
      </div>`;

    item.addEventListener('click', (e) => {
      if (e.target.closest('.layer-actions')) return;
      selectLayer(layer.id);
    });

    list.appendChild(item);
  });

  // Update summary layers count
  const summaryLayers = document.getElementById('summaryLayers');
  if (summaryLayers) summaryLayers.textContent = state.layers.length;
}

// ─── SELECT LAYER ────────────────────────
function selectLayer(id) {
  state.selectedLayer = id;
  renderLayers();

  const layer = state.layers.find(l => l.id === id);
  const props = document.getElementById('layerProps');

  if (layer && props) {
    props.style.display = 'block';

    const propOpacity = document.getElementById('propOpacity');
    const propOpacityVal = document.getElementById('propOpacityVal');
    const propRotation = document.getElementById('propRotation');
    const propRotationVal = document.getElementById('propRotationVal');
    const propScale = document.getElementById('propScale');
    const propScaleVal = document.getElementById('propScaleVal');
    const propX = document.getElementById('propX');
    const propY = document.getElementById('propY');

    if (propOpacity) propOpacity.value = layer.opacity || 100;
    if (propOpacityVal) propOpacityVal.textContent = (layer.opacity || 100) + '%';
    if (propRotation) propRotation.value = layer.rotation || 0;
    if (propRotationVal) propRotationVal.textContent = (layer.rotation || 0) + '°';
    if (propScale) propScale.value = layer.scale || 100;
    if (propScaleVal) propScaleVal.textContent = (layer.scale || 100) + '%';
    if (propX) propX.value = layer.x || 150;
    if (propY) propY.value = layer.y || 160;
  }
}

// ─── UPDATE LAYER PROP ───────────────────
function updateLayerProp(prop, value) {
  if (state.selectedLayer === null) return;
  const layer = state.layers.find(l => l.id === state.selectedLayer);
  if (!layer) return;

  const numVal = parseFloat(value);
  layer[prop] = numVal;

  // Update display
  if (prop === 'opacity') {
    const v = document.getElementById('propOpacityVal');
    if (v) v.textContent = numVal + '%';
  }
  if (prop === 'rotation') {
    const v = document.getElementById('propRotationVal');
    if (v) v.textContent = numVal + '°';
  }
  if (prop === 'scale') {
    const v = document.getElementById('propScaleVal');
    if (v) v.textContent = numVal + '%';
  }

  updateSVGDesign();
  updateShirt3DTexture();
}

// ─── DELETE LAYER ────────────────────────
function deleteLayer(id) {
  saveToHistory();
  state.layers = state.layers.filter(l => l.id !== id);
  if (state.selectedLayer === id) {
    state.selectedLayer = null;
    const props = document.getElementById('layerProps');
    if (props) props.style.display = 'none';
  }
  updateSVGDesign();
  renderLayers();
  updateShirt3DTexture();
}

function deleteSelectedLayer() {
  if (state.selectedLayer !== null) {
    deleteLayer(state.selectedLayer);
  }
}

// ─── MOVE LAYER ──────────────────────────
function moveLayer(id, dir) {
  const idx = state.layers.findIndex(l => l.id === id);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= state.layers.length) return;

  saveToHistory();
  const temp = state.layers[idx];
  state.layers[idx] = state.layers[newIdx];
  state.layers[newIdx] = temp;

  updateSVGDesign();
  renderLayers();
  updateShirt3DTexture();
}

// ─── DUPLICATE LAYER ─────────────────────
function duplicateLayer() {
  if (state.selectedLayer === null) return;
  const layer = state.layers.find(l => l.id === state.selectedLayer);
  if (!layer) return;

  saveToHistory();
  const copy = { ...layer, id: Date.now(), x: layer.x + 15, y: layer.y + 15 };
  state.layers.push(copy);

  updateSVGDesign();
  renderLayers();
  updateShirt3DTexture();
  showToast('Camada duplicada!');
}

// ─── TOOL SELECTION ──────────────────────
function setTool(tool) {
  state.currentTool = tool;
  document.querySelectorAll('.canvas-tool-btn').forEach(btn => btn.classList.remove('active'));
  const toolBtn = document.getElementById('tool' + tool.charAt(0).toUpperCase() + tool.slice(1));
  if (toolBtn) toolBtn.classList.add('active');
}

// ─── VIEW CONTROLS ────────────────────────
function setView(view, btn) {
  state.currentView = view;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const indicator = document.getElementById('viewIndicator');
  const labels = { front: 'FRENTE', back: 'COSTAS', left: 'LATERAL E', right: 'LATERAL D' };
  if (indicator) indicator.textContent = labels[view] || view.toUpperCase();

  if (isThreeReady && threeMesh) {
    const rotations = {
      front: 0,
      back: Math.PI,
      left: -Math.PI / 2,
      right: Math.PI / 2
    };
    threeMesh.rotation.y = rotations[view] || 0;
  } else {
    // CSS 3D
    const garment = document.getElementById('garment3d');
    if (garment) {
      const rotations = { front: 0, back: 180, left: -90, right: 90 };
      garment.style.transform = `rotateY(${rotations[view] || 0}deg)`;
    }
  }
}

function setManualRotation(value) {
  state.rotation = parseInt(value);
  if (isThreeReady && threeMesh) {
    threeMesh.rotation.y = (state.rotation * Math.PI) / 180;
  } else {
    const garment = document.getElementById('garment3d');
    if (garment) {
      garment.style.animation = 'none';
      garment.style.transform = `rotateY(${state.rotation}deg)`;
    }
  }
}

let autoRotateInterval;
function toggleAutoRotate() {
  state.autoRotate = !state.autoRotate;
  const icon = document.getElementById('autoRotateIcon');
  const label = document.getElementById('autoRotateLabel');

  if (state.autoRotate) {
    if (icon) icon.style.animation = 'fa-spin 1s linear infinite';
    if (label) label.textContent = 'Auto-Rotação: ON';

    if (!isThreeReady) {
      const garment = document.getElementById('garment3d');
      if (garment) garment.style.animation = 'garmentFloatAnim 5s ease-in-out infinite';
    }
  } else {
    if (icon) icon.style.animation = '';
    if (label) label.textContent = 'Auto-Rotação: OFF';
  }
}

function toggleWireframe() {
  state.wireframe = !state.wireframe;
  const label = document.getElementById('wireframeLabel');
  if (label) label.textContent = `Wireframe: ${state.wireframe ? 'ON' : 'OFF'}`;

  if (isThreeReady && threeMesh) {
    threeMesh.children.forEach(child => {
      if (child.material) {
        child.material.wireframe = state.wireframe;
      }
    });
  }
}

function toggleLighting() {
  if (!threeScene) return;
  threeScene.traverse(obj => {
    if (obj.isLight && obj !== threeScene.children[0]) {
      obj.visible = !obj.visible;
    }
  });
}

// ─── HISTORY ─────────────────────────────
function saveToHistory() {
  state.history.push(JSON.stringify(state.layers));
  if (state.history.length > 30) state.history.shift();
  state.redoStack = [];
}

function undoAction() {
  if (state.history.length === 0) return;
  state.redoStack.push(JSON.stringify(state.layers));
  state.layers = JSON.parse(state.history.pop());
  state.selectedLayer = null;
  updateSVGDesign();
  renderLayers();
  updateShirt3DTexture();
  showToast('Ação desfeita');
}

function redoAction() {
  if (state.redoStack.length === 0) return;
  state.history.push(JSON.stringify(state.layers));
  state.layers = JSON.parse(state.redoStack.pop());
  state.selectedLayer = null;
  updateSVGDesign();
  renderLayers();
  updateShirt3DTexture();
  showToast('Ação refeita');
}

// ─── CLEAR CANVAS ────────────────────────
function clearCanvas() {
  if (state.layers.length === 0) return;
  if (!confirm('Limpar todos os elementos do design?')) return;
  saveToHistory();
  state.layers = [];
  state.selectedLayer = null;
  const props = document.getElementById('layerProps');
  if (props) props.style.display = 'none';
  updateSVGDesign();
  renderLayers();
  updateShirt3DTexture();
  showToast('Canvas limpo');
}

// ─── DRAG & DROP INTERACTION ──────────────
function initDragDrop() {
  const viewport = document.getElementById('canvasViewport');
  if (!viewport) return;

  viewport.addEventListener('click', (e) => {
    // Hide hint after first interaction
    const hint = document.getElementById('canvasHint');
    if (hint) hint.style.opacity = '0';
  });
}

// ─── EXPORT DESIGN ───────────────────────
function exportDesign() {
  const svgEl = document.getElementById('garmentSvg');
  if (!svgEl) return;

  try {
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yasscrew-design.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Design exportado!');
  } catch(e) {
    showToast('Erro ao exportar. Tente novamente.', 'error');
  }
}

// ─── FULLSCREEN ───────────────────────────
function toggleFullscreen() {
  const area = document.getElementById('canvasArea');
  const icon = document.getElementById('fullscreenIcon');
  if (!area) return;

  if (!document.fullscreenElement) {
    area.requestFullscreen().then(() => {
      if (icon) icon.className = 'fas fa-compress';
    }).catch(() => {});
  } else {
    document.exitFullscreen().then(() => {
      if (icon) icon.className = 'fas fa-expand';
    }).catch(() => {});
  }
}

// ─── QTY CONTROL ─────────────────────────
function changeQty(delta) {
  state.quantity = Math.max(1, Math.min(100, state.quantity + delta));
  const display = document.getElementById('qtyDisplay');
  if (display) display.textContent = state.quantity;
  updateSummary();
}

// ─── SUMMARY UPDATE ──────────────────────
function updateSummary() {
  const piece = document.getElementById('summaryPiece');
  const size = document.getElementById('summarySize');
  const color = document.getElementById('summaryColor');
  const layersEl = document.getElementById('summaryLayers');
  const price = document.getElementById('summaryPrice');

  if (piece) piece.textContent = pieceNames[state.selectedPiece] || state.selectedPiece;
  if (size) size.textContent = state.selectedSize;
  if (color) color.textContent = state.baseColor;
  if (layersEl) layersEl.textContent = state.layers.length;

  const basePrice = prices[state.selectedPiece] || 89.90;
  const total = (basePrice * state.quantity).toFixed(2).replace('.', ',');
  if (price) price.textContent = `R$ ${total}`;
}

// ─── SAVE DESIGN ─────────────────────────
function saveDesign() {
  const designName = prompt('Nome do design:', `Design ${state.savedDesigns.length + 1}`);
  if (!designName) return;

  const design = {
    id: Date.now(),
    name: designName,
    piece: state.selectedPiece,
    size: state.selectedSize,
    baseColor: state.baseColor,
    layers: JSON.parse(JSON.stringify(state.layers.map(l => ({ ...l, img: null })))),
    savedAt: new Date().toLocaleDateString('pt-BR')
  };

  state.savedDesigns.unshift(design);
  if (state.savedDesigns.length > 10) state.savedDesigns.pop();

  localStorage.setItem('yasscrew_designs', JSON.stringify(state.savedDesigns));
  loadSavedDesigns();
  showToast(`Design "${designName}" salvo!`);
}

function loadSavedDesigns() {
  const list = document.getElementById('savedList');
  if (!list) return;

  state.savedDesigns = JSON.parse(localStorage.getItem('yasscrew_designs') || '[]');

  if (state.savedDesigns.length === 0) {
    list.innerHTML = `
      <div class="layers-empty">
        <i class="fas fa-bookmark"></i>
        <p>Nenhum design<br />salvo ainda</p>
      </div>`;
    return;
  }

  list.innerHTML = '';
  state.savedDesigns.forEach(design => {
    const item = document.createElement('div');
    item.className = 'saved-design-item';
    item.innerHTML = `
      <div class="saved-thumb" style="background:${design.baseColor};width:40px;height:40px;border-radius:4px;display:flex;align-items:center;justify-content:center;">
        <span style="font-family:'Bebas Neue';color:rgba(255,255,255,0.7);font-size:0.7rem">${design.piece.slice(0,2).toUpperCase()}</span>
      </div>
      <div class="saved-info">
        <div class="saved-name">${design.name}</div>
        <div class="saved-meta">${design.piece} • ${design.savedAt}</div>
      </div>
      <button class="layer-action-btn delete" onclick="deleteSavedDesign(${design.id})">
        <i class="fas fa-times"></i>
      </button>`;

    item.querySelector('.saved-info').addEventListener('click', () => loadDesign(design));
    item.querySelector('.saved-thumb').addEventListener('click', () => loadDesign(design));

    list.appendChild(item);
  });
}

function loadDesign(design) {
  state.selectedPiece = design.piece;
  state.selectedSize = design.size;
  state.baseColor = design.baseColor;
  state.layers = design.layers || [];

  setBaseColor(design.baseColor, null);
  updateSVGDesign();
  renderLayers();
  updateSummary();
  showToast(`Design "${design.name}" carregado!`);
}

function deleteSavedDesign(id) {
  state.savedDesigns = state.savedDesigns.filter(d => d.id !== id);
  localStorage.setItem('yasscrew_designs', JSON.stringify(state.savedDesigns));
  loadSavedDesigns();
}

// ─── SUBMIT ORDER ────────────────────────
async function submitOrder() {
  const notes = document.getElementById('orderNotes');
  const orderData = {
    piece: pieceNames[state.selectedPiece],
    size: state.selectedSize,
    baseColor: state.baseColor,
    layers: state.layers.length,
    quantity: state.quantity,
    notes: notes ? notes.value : '',
    price: (prices[state.selectedPiece] * state.quantity).toFixed(2)
  };

  // Save to API
  try {
    await fetch('tables/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        piece: orderData.piece,
        size: orderData.size,
        base_color: orderData.baseColor,
        elements: orderData.layers,
        quantity: orderData.quantity,
        notes: orderData.notes,
        total_price: parseFloat(orderData.price),
        status: 'pending'
      })
    });
  } catch(e) {
    console.log('Order save attempted:', e.message);
  }

  // Show modal
  const modal = document.getElementById('orderModal');
  const details = document.getElementById('modalDetails');

  if (details) {
    details.innerHTML = `
      <div class="modal-detail-row"><span>Peça</span><strong>${orderData.piece}</strong></div>
      <div class="modal-detail-row"><span>Tamanho</span><strong>${orderData.size}</strong></div>
      <div class="modal-detail-row"><span>Cor Base</span><strong>${orderData.baseColor}</strong></div>
      <div class="modal-detail-row"><span>Elementos</span><strong>${orderData.layers} camada(s)</strong></div>
      <div class="modal-detail-row"><span>Quantidade</span><strong>${orderData.quantity} un.</strong></div>
      <div class="modal-detail-row"><span>Total</span><strong style="color:#E63946">R$ ${orderData.price.replace('.', ',')}</strong></div>`;
  }

  if (modal) modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('orderModal');
  if (modal) modal.style.display = 'none';
}

// ─── TOAST NOTIFICATION ──────────────────
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
    <span>${message}</span>`;

  toast.style.cssText = `
    position: fixed;
    bottom: 32px;
    right: 32px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    background: ${type === 'error' ? 'rgba(230,57,70,0.95)' : 'rgba(39,201,63,0.95)'};
    color: white;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    z-index: 9999;
    animation: slideInUp 0.3s ease;
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);`;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── ORDER BTN NAV ────────────────────────
const orderBtn = document.getElementById('orderBtn');
if (orderBtn) {
  orderBtn.addEventListener('click', () => {
    navigateStep(4 - state.currentStep);
  });
}

// ─── KEYBOARD SHORTCUTS ───────────────────
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z') { e.preventDefault(); undoAction(); }
    if (e.key === 'y') { e.preventDefault(); redoAction(); }
    if (e.key === 's') { e.preventDefault(); saveDesign(); }
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (state.selectedLayer !== null && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      deleteSelectedLayer();
    }
  }
  if (e.key === 'Escape') {
    state.selectedLayer = null;
    renderLayers();
    const props = document.getElementById('layerProps');
    if (props) props.style.display = 'none';
  }
});
