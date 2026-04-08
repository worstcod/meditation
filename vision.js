// vision.js - MediaPipe Holistic & Particle Physics Logic

let holistic;
let camera;
let visionInitialized = false;
let isCalibrating = false;
let calibrationFrames = 0;
let baselinePoints = null;

// Custom Tracking Engine
let isCustomizingTargets = false;
let customTrackingPoints = []; // User selected IDs
let latestLandmarks = null; 

// The specific allowed tracking targets requested by user
const TARGET_NODES = [
    { id: 0, name: "Nose" },
    { id: 2, name: "Left Eye" },
    { id: 5, name: "Right Eye" },
    { id: 9, name: "Left Mouth" },
    { id: 10, name: "Right Mouth" },
    { id: 11, name: "Left Shoulder" },
    { id: 12, name: "Right Shoulder" },
    { id: 25, name: "Left Knee" },
    { id: 26, name: "Right Knee" },
    { id: 100, name: "Center Chest" } // Artificial Node
];

// Smoothing Engine
let strikeDebounceCounter = 0;
const STRIKE_FRAMES_REQ = 10; 
const CALIBRATION_TARGET = 60; // Approx 2 seconds at 30fps

// Offscreen canvas for masking
let offCanvas = null;
let offCtx = null;

// Particle Engine Array
let particles = [];
let burstActive = false;
let burstFrames = 0;

function burstAuraParticles() {
    burstActive = true;
    burstFrames = 60; 
    const w = document.getElementById('output_canvas').width;
    const h = document.getElementById('output_canvas').height;
    
    // Spawn falling particles to simulate energy loss!
    for(let i=0; i<80; i++) {
        particles.push({
            x: w/2 + (Math.random() - 0.5) * 400,
            y: h/2 + (Math.random() - 0.5) * 400,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 8 + 3, // downward surge
            radius: Math.random() * 12 + 4,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.01,
            isBurst: true
        });
    }
}

function spawnAmbientBubble(w, h) {
    const levelMulti = (typeof gameState !== 'undefined') ? gameState.currentLevel : 1;
    
    const spawnCount = Math.floor(Math.random() * (4 + levelMulti * 0.2)) + 2;
    
    for (let i = 0; i < spawnCount; i++) {
        particles.push({
            x: w/2 + (Math.random() - 0.5) * (w * 0.9), // Span across width
            y: -20, // Drop from tap (top of screen)
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 4 + 2 + (levelMulti * 0.1), // Fall rapidly DOWNWARDS into the bucket/aura
            radius: Math.random() * 2.5 + 1.0, // Substantially smaller drops
            life: 0.0, 
            decay: Math.random() * 0.004 + 0.001, // Long life to reach bottom
            isBurst: false
        });
    }
}

function renderParticles(ctx, colorHex, w, h) {
    ctx.save();
    ctx.fillStyle = colorHex;
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 10;
    
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        ctx.globalAlpha = p.isBurst ? p.life : (p.life > 0.5 ? 1.0 - p.life : p.life * 2);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.isBurst) {
            p.life -= p.decay;
        } else {
            p.life += p.decay;
            if (p.x < w/2) p.vx += 0.02; else p.vx -= 0.02;
        }

        if ((p.isBurst && p.life <= 0) || (!p.isBurst && p.life >= 1.0) || p.y > h+100 || p.y < -100) {
            particles.splice(i, 1);
        }
    }
    ctx.restore();
}

function getChestNode(poseArr) {
    if (!poseArr || !poseArr[11] || !poseArr[12]) return null;
    return {
        x: (poseArr[11].x + poseArr[12].x) / 2,
        y: (poseArr[11].y + poseArr[12].y) / 2,
        z: (poseArr[11].z + poseArr[12].z) / 2,
        visibility: Math.min(poseArr[11].visibility, poseArr[12].visibility)
    };
}

function initVision() {
    return new Promise((resolve, reject) => {
        if (visionInitialized) {
            resolve();
            return;
        }

        const videoElement = document.getElementById('input_video');
        const canvasElement = document.getElementById('output_canvas');
        canvasElement.classList.remove('hidden');
        const canvasCtx = canvasElement.getContext('2d');

        offCanvas = document.createElement('canvas');
        offCtx = offCanvas.getContext('2d');

        if (typeof Holistic === 'undefined') {
            reject(new Error("MediaPipe not loaded. Check connection."));
            return;
        }

        holistic = new Holistic({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
        }});

        holistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: true,
            smoothSegmentation: true,
            refineFaceLandmarks: true,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });
        
        // CLICK HANDLER FOR CUSTOM TARGETS
        canvasElement.addEventListener('click', (e) => {
            if (!isCustomizingTargets || !latestLandmarks || !latestLandmarks.poseLandmarks) return;
            
            const rect = canvasElement.getBoundingClientRect();
            // Invert X because of CSS transform: scaleX(-1) mirror effect
            const rawX = (e.clientX - rect.left) / rect.width;
            const normX = 1.0 - rawX; 
            const normY = (e.clientY - rect.top) / rect.height;

            let closestIdx = -1;
            let minDist = Infinity;
            
            // Check all standard 33 pose nodes
            for (let i = 0; i <= 32; i++) {
                let pt = latestLandmarks.poseLandmarks[i];
                if (!pt || pt.visibility < 0.5) continue;
                
                const dx = pt.x - normX;
                const dy = pt.y - normY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < minDist) {
                    minDist = dist;
                    closestIdx = i;
                }
            }
            
            // Also check artificial chest node
            const artificialChest = getChestNode(latestLandmarks.poseLandmarks);
            if (artificialChest && artificialChest.visibility >= 0.5) {
                const dx = artificialChest.x - normX;
                const dy = artificialChest.y - normY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < minDist) {
                    minDist = dist;
                    closestIdx = 100;
                }
            }

            // If we tapped close enough to a body part (within ~10% of screen size distance)
            if (closestIdx !== -1 && minDist < 0.1) {
                if (customTrackingPoints.includes(closestIdx)) {
                    customTrackingPoints = customTrackingPoints.filter(id => id !== closestIdx);
                } else {
                    customTrackingPoints.push(closestIdx);
                }
            }
        });

        holistic.onResults((results) => {
            try {
                latestLandmarks = results;
                const w = canvasElement.width;
                const h = canvasElement.height;
                
                if (offCanvas.width !== w) {
                    offCanvas.width = w; offCanvas.height = h;
                }

                canvasCtx.save();
                canvasCtx.clearRect(0, 0, w, h);

                // 1. Render Real Room Background (With optional blur)
                if (!isCustomizingTargets) {
                    if (gameState.blurRoom) {
                        canvasCtx.save();
                        canvasCtx.filter = 'blur(15px)';
                        canvasCtx.drawImage(results.image, 0, 0, w, h);
                        canvasCtx.restore();
                    } else {
                        canvasCtx.drawImage(results.image, 0, 0, w, h);
                    }
                } else {
                    canvasCtx.drawImage(results.image, 0, 0, w, h);
                }

                let renderPersonOpaque = false;

                const currentAuraHex = getAuraHexColor(getAuraColor(gameState.currentLevel));

                if (gameState.isRunning && !gameState.isPaused) {
                    if (burstFrames > 0) burstFrames--;
                    else burstActive = false;
                    if (!burstActive) spawnAmbientBubble(w, h);
                }

                // 2. Combine Segmentation Mask & Foregrounds
                if (results.segmentationMask && (gameState.isRunning || isCustomizingTargets)) {
                    
                    if (gameState.isRunning) {
                        const elapsed = gameState.totalElapsedSeconds;
                        
                        // Fades the base aura in quickly over the very first 5 seconds
                        const initialFade = Math.min(1.0, elapsed / 5.0); 

                        // Density and Thickness algorithms - growing progressively with Level
                        const targetAlpha = 0.3 + (gameState.currentLevel * 0.05); // starts at 0.3, maxes near 0.95
                        let auraBaseAlpha = Math.min(0.95, initialFade * targetAlpha);
                        
                        // Increase aggressive blur thickness with level
                        const blurScale = 15 + (gameState.currentLevel * 6); 

                        offCtx.globalCompositeOperation = 'source-over';
                        offCtx.clearRect(0,0,w,h);
                        offCtx.drawImage(results.segmentationMask, 0, 0, w, h);
                        
                        offCtx.globalCompositeOperation = 'source-in';
                        offCtx.fillStyle = currentAuraHex;
                        offCtx.fillRect(0, 0, w, h);

                        if (auraBaseAlpha > 0.01) {
                            canvasCtx.globalCompositeOperation = 'source-over';
                            canvasCtx.filter = `blur(${blurScale}px)`;
                            canvasCtx.globalAlpha = auraBaseAlpha;
                            canvasCtx.drawImage(offCanvas, 0, 0, w, h);
                            
                            // A second pass to make the halo strongly visible
                            canvasCtx.drawImage(offCanvas, 0, 0, w, h); 
                            
                            // Additional density layering based on level progression
                            if (gameState.currentLevel >= 3) {
                                 canvasCtx.globalAlpha = auraBaseAlpha * 0.8;
                                 canvasCtx.drawImage(offCanvas, 0, 0, w, h);
                            }
                            if (gameState.currentLevel >= 8) {
                                 canvasCtx.filter = `blur(${blurScale * 1.5}px)`; 
                                 canvasCtx.globalAlpha = auraBaseAlpha * 0.5;
                                 canvasCtx.drawImage(offCanvas, 0, 0, w, h); // Big outer glow
                            }

                            canvasCtx.filter = 'none';
                            canvasCtx.globalAlpha = 1.0;
                        }
                    }

                    renderParticles(canvasCtx, currentAuraHex, w, h);

                    offCtx.globalCompositeOperation = 'source-over';
                    offCtx.clearRect(0,0,w,h);
                    offCtx.drawImage(results.segmentationMask, 0, 0, w, h);
                    
                    offCtx.globalCompositeOperation = 'source-in';
                    offCtx.drawImage(results.image, 0, 0, w, h);

                    canvasCtx.globalCompositeOperation = 'source-over';
                    canvasCtx.drawImage(offCanvas, 0, 0, w, h);
                } else {
                    renderParticles(canvasCtx, currentAuraHex, w, h);
                    // Ensure the person is visible if segmentation hasn't started!
                    // Since canvas is transparent over full bg, drawing them fully is safe.
                    renderPersonOpaque = true; 
                }
                
                if (renderPersonOpaque) {
                    canvasCtx.globalAlpha = 1.0; 
                    canvasCtx.drawImage(results.image, 0, 0, w, h);
                }
                
                // 3. UI Node Rendering
                if (!gameState.isRunning || isCustomizingTargets) {
                     if (results.poseLandmarks) {
                        // Draw skeletal connections faintly mapped
                        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: 'rgba(255, 255, 255, 0.1)', lineWidth: 1});
                        
                        // Highlight all nodes when selecting custom targets
                        if (isCustomizingTargets) {
                            const drawTargetPointForCustomizing = (pt, id) => {
                                canvasCtx.beginPath();
                                canvasCtx.arc(pt.x * w, pt.y * h, 6, 0, 2*Math.PI);
                                if (customTrackingPoints.includes(id)) {
                                    canvasCtx.fillStyle = '#00ffcc'; // Green as requested
                                    canvasCtx.shadowColor = '#00ffcc';
                                    canvasCtx.shadowBlur = 10;
                                } else {
                                    canvasCtx.fillStyle = '#ff3366'; // Red
                                    canvasCtx.shadowBlur = 0;
                                }
                                canvasCtx.fill();
                                canvasCtx.shadowBlur = 0;
                            };

                            const chestNode = getChestNode(results.poseLandmarks);
                            
                            for (let i = 0; i <= 32; i++) {
                                const pt = results.poseLandmarks[i];
                                if (pt && pt.visibility > 0.5) drawTargetPointForCustomizing(pt, i);
                            }
                            if (chestNode && chestNode.visibility > 0.5) {
                                drawTargetPointForCustomizing(chestNode, 100);
                            }
                        }
                    }
                }

                if (gameState.isRunning && !gameState.isPaused) {
                    processGameFrame(results, canvasCtx, w, h);
                }

                canvasCtx.restore();
            } catch(e) {
                console.error("Render Loop Safety Catch: ", e);
            }
        });

        camera = new Camera(videoElement, {
            onFrame: async () => {
                if (canvasElement.width !== videoElement.videoWidth) {
                   canvasElement.width = videoElement.videoWidth;
                   canvasElement.height = videoElement.videoHeight;
                }
                await holistic.send({image: videoElement});
            },
            width: 640,
            height: 480
        });

        camera.start().then(() => {
            visionInitialized = true;
            resolve();
        }).catch(err => {
            console.error("Camera startup failed:", err);
            reject(err);
        });
    });
}

function startCalibration() {
    isCalibrating = true;
    calibrationFrames = 0;
    strikeDebounceCounter = 0;
    particles = []; 
    document.getElementById('status_text').innerText = "CALIBRATING AURA... STAY STILL";
    document.getElementById('status_text').classList.add('status-pulse');
}

function processGameFrame(results, ctx, w, h) {
    if (!results.poseLandmarks) return;

    const chestNode = getChestNode(results.poseLandmarks);

    // Use user-defined custom targets, OR default to Head, Eyes, Shoulders, and Chest
    const targetSetIds = customTrackingPoints.length > 0 ? customTrackingPoints : [0, 2, 5, 11, 12, 100];
    
    // Extrapolate actual coordinate objects
    const currentPoints = targetSetIds.map(id => {
        if (id === 100) return chestNode;
        return results.poseLandmarks[id];
    });

    const isSamadhi = (typeof gameState !== 'undefined' && gameState.mode === 'samadhi');
    const dynamicStrikeFrames = isSamadhi ? 5 : STRIKE_FRAMES_REQ;

    // Calculate shoulder width for dynamic threshold limits (to simulate 3cm-4cm)
    let dynamicThreshold = 0.08; 
    if (results.poseLandmarks[11] && results.poseLandmarks[12]) {
        const sx = results.poseLandmarks[11].x - results.poseLandmarks[12].x;
        const sy = results.poseLandmarks[11].y - results.poseLandmarks[12].y;
        const shoulderWidth = Math.sqrt(sx*sx + sy*sy);
        // Extremely strict (8%) for samadhi, generous (15%) for normal
        const thresholdMultiplier = isSamadhi ? 0.08 : 0.15;
        dynamicThreshold = Math.max(0.04, shoulderWidth * thresholdMultiplier); 
    }

    if (isCalibrating) {
        calibrationFrames++;
        if (calibrationFrames >= CALIBRATION_TARGET) {
            baselinePoints = [ ...currentPoints ];
            isCalibrating = false;
            document.getElementById('status_text').innerText = "AURA SECURED. MEDITATING...";
            document.getElementById('status_text').classList.remove('status-pulse');
        }
    } else if (baselinePoints && baselinePoints.length === currentPoints.length) {
        let strikeTriggered = false;
        
        currentPoints.forEach((pt, i) => {
            if (pt && baselinePoints[i]) {
                drawAuraTarget(ctx, baselinePoints[i], w, h, dynamicThreshold);
                const dx = pt.x - baselinePoints[i].x;
                const dy = pt.y - baselinePoints[i].y;
                if (Math.sqrt(dx*dx + dy*dy) > dynamicThreshold) {
                    strikeTriggered = true;
                }
            }
        });

        if (strikeTriggered) {
            strikeDebounceCounter++;
            if (strikeDebounceCounter >= dynamicStrikeFrames) {
                registerStrike(); 
                strikeDebounceCounter = 0; // Reset
                baselinePoints = [ ...currentPoints ]; // Recalibrate instantly so they don't bounce rapid strikes
            }
        } else {
            strikeDebounceCounter = 0; // Heal debounce buffer
        }
    }
}

function drawAuraTarget(ctx, pt, w, h, threshold) {
    if (!pt) return;
    const radius = w * threshold;
    ctx.beginPath();
    ctx.arc(pt.x * w, pt.y * h, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
}
