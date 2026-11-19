import { useEffect, useRef } from "react";

const SIM_RES = 128; // Short-edge resolution for the velocity and pressure field.
const DYE_RES = 512; // Short-edge resolution for the visible smoke color.
const DENSITY_DISSIPATION = 0.985; // Lower values make trails fade sooner.
const VELOCITY_DISSIPATION = 0.98; // Lower values reduce how far smoke drifts.
const PRESSURE_ITERATIONS = 16; // More iterations improve incompressibility at added cost.
const CURL = 18; // Vorticity confinement strength.
const SPLAT_RADIUS = 0.0016; // Aspect-corrected radius for each emitted puff.
const SPLAT_FORCE = 3200; // Pointer momentum before viewport-size scaling.
const SMOKE_OPACITY = 0.55; // Maximum final alpha over the intro background.
const GOLD_SHARE = 0.15; // Small chance for a champagne-gold puff.
const MAX_SPLATS_PER_FRAME = 16; // Bounds GPU work during fast pointer movement.
const MAX_QUEUED_SPLATS = 96; // Bounds queued input between animation frames.

const CONTEXT_ATTRIBUTES = {
  alpha: true,
  premultipliedAlpha: true,
  antialias: false,
  depth: false,
};

const SMOKE_COLORS = {
  burgundy: [0x6b / 255, 0x0f / 255, 0x24 / 255],
  crimson: [0xa3 / 255, 0x15 / 255, 0x2f / 255],
  gold: [0xe4 / 255, 0xbe / 255, 0x71 / 255],
};

const VERTEX_SHADER_WEBGL2 = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const VERTEX_SHADER_WEBGL1 = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_HEADER_WEBGL2 = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
#define textureLookup texture
#define outColor fragColor
vec4 sampleLinear(sampler2D source, vec2 uv, vec2 texel) {
  vec2 grid = uv / texel - 0.5;
  vec2 base = (floor(grid) + 0.5) * texel;
  vec2 blend = fract(grid);
  vec4 lower = mix(
    textureLookup(source, base),
    textureLookup(source, base + vec2(texel.x, 0.0)),
    blend.x
  );
  vec4 upper = mix(
    textureLookup(source, base + vec2(0.0, texel.y)),
    textureLookup(source, base + texel),
    blend.x
  );
  return mix(lower, upper, blend.y);
}
`;

const FRAGMENT_HEADER_WEBGL1 = `
precision highp float;
varying vec2 vUv;
#define textureLookup texture2D
#define outColor gl_FragColor
vec4 sampleLinear(sampler2D source, vec2 uv, vec2 texel) {
  vec2 grid = uv / texel - 0.5;
  vec2 base = (floor(grid) + 0.5) * texel;
  vec2 blend = fract(grid);
  vec4 lower = mix(
    textureLookup(source, base),
    textureLookup(source, base + vec2(texel.x, 0.0)),
    blend.x
  );
  vec4 upper = mix(
    textureLookup(source, base + vec2(0.0, texel.y)),
    textureLookup(source, base + texel),
    blend.x
  );
  return mix(lower, upper, blend.y);
}
`;

const SHADERS = {
  advect: `
uniform sampler2D uSource;
uniform sampler2D uVelocity;
uniform vec2 uSourceTexel;
uniform vec2 uVelocityTexel;
uniform float uDt;
uniform float uDissipation;
void main() {
  vec2 velocity = sampleLinear(uVelocity, vUv, uVelocityTexel).xy;
  vec3 source = sampleLinear(uSource, vUv - velocity * uDt, uSourceTexel).rgb;
  outColor = vec4(source * uDissipation, 1.0);
}`,
  dyeSplat: `
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform vec3 uColor;
uniform float uRadius;
uniform float uAspect;
uniform float uIntensity;
void main() {
  vec2 point = vUv - uPoint;
  point.x *= uAspect;
  float falloff = exp(-dot(point, point) / uRadius);
  vec3 dye = textureLookup(uTarget, vUv).rgb + uColor * falloff * uIntensity;
  outColor = vec4(dye, 1.0);
}`,
  velocitySplat: `
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform vec2 uDelta;
uniform float uRadius;
uniform float uAspect;
uniform float uForce;
void main() {
  vec2 point = vUv - uPoint;
  point.x *= uAspect;
  float falloff = exp(-dot(point, point) / uRadius);
  vec2 velocity = textureLookup(uTarget, vUv).xy + uDelta * uForce * falloff;
  outColor = vec4(velocity, 0.0, 1.0);
}`,
  curl: `
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float left = textureLookup(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float right = textureLookup(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float bottom = textureLookup(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  float top = textureLookup(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  float value = 0.5 * (right - left - top + bottom);
  outColor = vec4(value, 0.0, 0.0, 1.0);
}`,
  vorticity: `
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexel;
uniform float uDt;
uniform float uCurlStrength;
void main() {
  float left = abs(textureLookup(uCurl, vUv - vec2(uTexel.x, 0.0)).x);
  float right = abs(textureLookup(uCurl, vUv + vec2(uTexel.x, 0.0)).x);
  float bottom = abs(textureLookup(uCurl, vUv - vec2(0.0, uTexel.y)).x);
  float top = abs(textureLookup(uCurl, vUv + vec2(0.0, uTexel.y)).x);
  float center = textureLookup(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(top - bottom, right - left);
  force /= length(force) + 0.0001;
  force *= uCurlStrength * center * uDt * min(uTexel.x, uTexel.y) * 0.08;
  force.y *= -1.0;
  vec2 velocity = textureLookup(uVelocity, vUv).xy + force;
  outColor = vec4(velocity, 0.0, 1.0);
}`,
  divergence: `
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float left = textureLookup(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
  float right = textureLookup(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
  float bottom = textureLookup(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
  float top = textureLookup(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
  outColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);
}`,
  pressure: `
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexel;
void main() {
  float left = textureLookup(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float right = textureLookup(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float bottom = textureLookup(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float top = textureLookup(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float divergence = textureLookup(uDivergence, vUv).x;
  outColor = vec4((left + right + bottom + top - divergence) * 0.25, 0.0, 0.0, 1.0);
}`,
  gradient: `
uniform sampler2D uVelocity;
uniform sampler2D uPressure;
uniform vec2 uTexel;
void main() {
  float left = textureLookup(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float right = textureLookup(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float bottom = textureLookup(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float top = textureLookup(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  vec2 velocity = textureLookup(uVelocity, vUv).xy - 0.5 * vec2(right - left, top - bottom);
  outColor = vec4(velocity, 0.0, 1.0);
}`,
  display: `
uniform sampler2D uDye;
uniform vec2 uDyeTexel;
uniform float uOpacity;
void main() {
  vec3 dye = sampleLinear(uDye, vUv, uDyeTexel).rgb;
  float brightness = max(dye.r, max(dye.g, dye.b));
  float alpha = clamp(brightness * uOpacity, 0.0, uOpacity);
  vec3 color = dye / max(brightness, 0.0001);
  outColor = vec4(color * alpha, alpha);
}`,
};

function supportsHalfFloatTarget(gl, isWebGL2) {
  const textureExtension = isWebGL2
    ? gl.getExtension("EXT_color_buffer_float")
    : gl.getExtension("OES_texture_half_float");
  const colorExtension = isWebGL2
    ? textureExtension
    : gl.getExtension("EXT_color_buffer_half_float");
  if (!textureExtension || !colorExtension) return false;

  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  if (!texture || !framebuffer) {
    if (texture) gl.deleteTexture(texture);
    if (framebuffer) gl.deleteFramebuffer(framebuffer);
    return false;
  }

  const halfFloat = isWebGL2 ? gl.HALF_FLOAT : textureExtension.HALF_FLOAT_OES;
  const internalFormat = isWebGL2 ? gl.RGBA16F : gl.RGBA;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 2, 2, 0, gl.RGBA, halfFloat, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );
  const supported = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.deleteFramebuffer(framebuffer);
  gl.deleteTexture(texture);
  return supported;
}

function getSupportedContextType() {
  let probe = document.createElement("canvas");
  let gl = null;
  try {
    gl = probe.getContext("webgl2", CONTEXT_ATTRIBUTES);
    if (gl) {
      const supported = supportsHalfFloatTarget(gl, true);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (supported) return "webgl2";
    }

    probe = document.createElement("canvas");
    gl = probe.getContext("webgl", CONTEXT_ATTRIBUTES);
    if (!gl) gl = probe.getContext("experimental-webgl", CONTEXT_ATTRIBUTES);
    if (gl) {
      const supported = supportsHalfFloatTarget(gl, false);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (supported) return "webgl";
    }
  } catch {
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  return null;
}

function SmokeTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const noHover = window.matchMedia("(hover: none)");
    if (reducedMotion.matches || coarsePointer.matches || noHover.matches) {
      return undefined;
    }

    const contextType = getSupportedContextType();
    if (!contextType) return undefined;

    let gl = null;
    let animationFrame = 0;
    let lastFrameTime = 0;
    let lastPointer = null;
    let targetSizeKey = "";
    let simulation = null;
    let stopped = false;
    let positionBuffer = null;
    let handlePointerMove = () => {};
    let handleResize = () => {};
    let handleVisibilityChange = () => {};
    const textures = new Set();
    const framebuffers = new Set();
    const programs = new Set();
    const splats = [];

    const disposeTargets = () => {
      if (!gl) return;
      framebuffers.forEach((framebuffer) => gl.deleteFramebuffer(framebuffer));
      textures.forEach((texture) => gl.deleteTexture(texture));
      framebuffers.clear();
      textures.clear();
      targetSizeKey = "";
      simulation = null;
    };

    const cleanup = () => {
      if (stopped) return;
      stopped = true;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      disposeTargets();
      if (gl) {
        // Do not call loseContext here: StrictMode remounts reuse this canvas, and a lost context would stay white.
        programs.forEach((program) => gl.deleteProgram(program));
        programs.clear();
        if (positionBuffer) gl.deleteBuffer(positionBuffer);
        gl = null;
      }
    };

    try {
      gl = canvas.getContext(contextType, CONTEXT_ATTRIBUTES);
    } catch {
      return undefined;
    }
    if (!gl) return undefined;

    const isWebGL2 = contextType === "webgl2";
    const halfFloatExtension = isWebGL2
      ? gl.getExtension("EXT_color_buffer_float")
      : gl.getExtension("OES_texture_half_float");
    const colorBufferExtension = isWebGL2
      ? halfFloatExtension
      : gl.getExtension("EXT_color_buffer_half_float");
    if (!halfFloatExtension || !colorBufferExtension) {
      cleanup();
      return undefined;
    }

    const halfFloatType = isWebGL2
      ? gl.HALF_FLOAT
      : halfFloatExtension.HALF_FLOAT_OES;
    const linearExtension = isWebGL2
      ? gl.getExtension("OES_texture_float_linear")
      : gl.getExtension("OES_texture_half_float_linear");
    const textureFilter = linearExtension ? gl.LINEAR : gl.NEAREST;
    const internalFormat = isWebGL2 ? gl.RGBA16F : gl.RGBA;
    const fragmentHeader = isWebGL2
      ? FRAGMENT_HEADER_WEBGL2
      : FRAGMENT_HEADER_WEBGL1;
    const vertexSource = isWebGL2
      ? VERTEX_SHADER_WEBGL2
      : VERTEX_SHADER_WEBGL1;
    const shaderPrograms = {};

    const createTarget = (width, height) => {
      const texture = gl.createTexture();
      const framebuffer = gl.createFramebuffer();
      if (!texture || !framebuffer) {
        if (texture) gl.deleteTexture(texture);
        if (framebuffer) gl.deleteFramebuffer(framebuffer);
        return null;
      }

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, textureFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, textureFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        width,
        height,
        0,
        gl.RGBA,
        halfFloatType,
        null,
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      if (complete) {
        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, null);
      if (!complete) {
        gl.deleteFramebuffer(framebuffer);
        gl.deleteTexture(texture);
        return null;
      }
      textures.add(texture);
      framebuffers.add(framebuffer);
      return { texture, framebuffer, width, height };
    };

    const createPair = (width, height) => {
      const first = createTarget(width, height);
      const second = createTarget(width, height);
      return first && second ? { read: first, write: second } : null;
    };

    const createProgram = (fragmentBody) => {
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      if (!vertexShader || !fragmentShader) {
        if (vertexShader) gl.deleteShader(vertexShader);
        if (fragmentShader) gl.deleteShader(fragmentShader);
        return null;
      }

      gl.shaderSource(vertexShader, vertexSource);
      gl.shaderSource(fragmentShader, fragmentHeader + fragmentBody);
      gl.compileShader(vertexShader);
      gl.compileShader(fragmentShader);
      const compiled =
        gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) &&
        gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
      if (!compiled) {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return null;
      }

      const program = gl.createProgram();
      if (!program) {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return null;
      }
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return null;
      }
      programs.add(program);
      return {
        handle: program,
        position: gl.getAttribLocation(program, "aPosition"),
        uniforms: new Map(),
      };
    };

    const getUniform = (program, name) => {
      if (!program.uniforms.has(name)) {
        program.uniforms.set(name, gl.getUniformLocation(program.handle, name));
      }
      return program.uniforms.get(name);
    };

    const bindTexture = (program, name, target, unit) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, target.texture);
      gl.uniform1i(getUniform(program, name), unit);
    };

    const draw = (program, target, setup) => {
      if (!program || program.position < 0) return;
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
      gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);
      gl.useProgram(program.handle);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(program.position);
      gl.vertexAttribPointer(program.position, 2, gl.FLOAT, false, 0, 0);
      setup(program);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    Object.entries(SHADERS).forEach(([name, body]) => {
      shaderPrograms[name] = createProgram(body);
    });
    positionBuffer = gl.createBuffer();
    if (positionBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );
    }
    if (!positionBuffer || Object.values(shaderPrograms).some((program) => !program)) {
      cleanup();
      return undefined;
    }

    const swap = (pair) => {
      const previousRead = pair.read;
      pair.read = pair.write;
      pair.write = previousRead;
    };

    const clearTarget = (target) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
      gl.viewport(0, 0, target.width, target.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return false;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(bounds.width * pixelRatio));
      const height = Math.max(1, Math.round(bounds.height * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const aspect = bounds.width / bounds.height;
      const simWidth = Math.max(2, Math.round(SIM_RES * Math.max(1, aspect)));
      const simHeight = Math.max(2, Math.round(SIM_RES * Math.max(1, 1 / aspect)));
      const dyeWidth = Math.max(2, Math.round(DYE_RES * Math.max(1, aspect)));
      const dyeHeight = Math.max(2, Math.round(DYE_RES * Math.max(1, 1 / aspect)));
      const nextKey = `${simWidth}x${simHeight}:${dyeWidth}x${dyeHeight}`;
      if (targetSizeKey === nextKey && simulation) return true;

      disposeTargets();
      simulation = {
        velocity: createPair(simWidth, simHeight),
        pressure: createPair(simWidth, simHeight),
        dye: createPair(dyeWidth, dyeHeight),
        divergence: createTarget(simWidth, simHeight),
        curl: createTarget(simWidth, simHeight),
      };
      if (
        !simulation.velocity ||
        !simulation.pressure ||
        !simulation.dye ||
        !simulation.divergence ||
        !simulation.curl
      ) {
        disposeTargets();
        return false;
      }
      targetSizeKey = nextKey;
      splats.length = 0;
      lastPointer = null;
      return true;
    };

    const renderSplat = (splat, aspect, force) => {
      const { velocity, dye } = simulation;
      const point = [splat.x, splat.y];
      draw(shaderPrograms.velocitySplat, velocity.write, (program) => {
        bindTexture(program, "uTarget", velocity.read, 0);
        gl.uniform2f(getUniform(program, "uPoint"), point[0], point[1]);
        gl.uniform2f(getUniform(program, "uDelta"), splat.dx, splat.dy);
        gl.uniform1f(getUniform(program, "uRadius"), SPLAT_RADIUS);
        gl.uniform1f(getUniform(program, "uAspect"), aspect);
        gl.uniform1f(getUniform(program, "uForce"), force);
      });
      swap(velocity);

      draw(shaderPrograms.dyeSplat, dye.write, (program) => {
        bindTexture(program, "uTarget", dye.read, 0);
        gl.uniform2f(getUniform(program, "uPoint"), point[0], point[1]);
        gl.uniform3f(
          getUniform(program, "uColor"),
          splat.color[0],
          splat.color[1],
          splat.color[2],
        );
        gl.uniform1f(getUniform(program, "uRadius"), SPLAT_RADIUS);
        gl.uniform1f(getUniform(program, "uAspect"), aspect);
        gl.uniform1f(getUniform(program, "uIntensity"), splat.intensity);
      });
      swap(dye);
    };

    const simulate = (deltaTime, aspect) => {
      const { velocity, pressure, dye, divergence, curl } = simulation;
      const simTexel = [1 / velocity.read.width, 1 / velocity.read.height];
      const dyeTexel = [1 / dye.read.width, 1 / dye.read.height];
      const dt = deltaTime * 60;
      const force = (SPLAT_FORCE / Math.max(canvas.width, canvas.height)) * 0.12;

      for (let index = 0; index < MAX_SPLATS_PER_FRAME && splats.length; index += 1) {
        renderSplat(splats.shift(), aspect, force);
      }

      draw(shaderPrograms.curl, curl, (program) => {
        bindTexture(program, "uVelocity", velocity.read, 0);
        gl.uniform2f(getUniform(program, "uTexel"), simTexel[0], simTexel[1]);
      });

      draw(shaderPrograms.vorticity, velocity.write, (program) => {
        bindTexture(program, "uVelocity", velocity.read, 0);
        bindTexture(program, "uCurl", curl, 1);
        gl.uniform2f(getUniform(program, "uTexel"), simTexel[0], simTexel[1]);
        gl.uniform1f(getUniform(program, "uDt"), dt);
        gl.uniform1f(getUniform(program, "uCurlStrength"), CURL);
      });
      swap(velocity);

      draw(shaderPrograms.divergence, divergence, (program) => {
        bindTexture(program, "uVelocity", velocity.read, 0);
        gl.uniform2f(getUniform(program, "uTexel"), simTexel[0], simTexel[1]);
      });

      clearTarget(pressure.read);
      for (let iteration = 0; iteration < PRESSURE_ITERATIONS; iteration += 1) {
        draw(shaderPrograms.pressure, pressure.write, (program) => {
          bindTexture(program, "uPressure", pressure.read, 0);
          bindTexture(program, "uDivergence", divergence, 1);
          gl.uniform2f(getUniform(program, "uTexel"), simTexel[0], simTexel[1]);
        });
        swap(pressure);
      }

      draw(shaderPrograms.gradient, velocity.write, (program) => {
        bindTexture(program, "uVelocity", velocity.read, 0);
        bindTexture(program, "uPressure", pressure.read, 1);
        gl.uniform2f(getUniform(program, "uTexel"), simTexel[0], simTexel[1]);
      });
      swap(velocity);

      draw(shaderPrograms.advect, velocity.write, (program) => {
        bindTexture(program, "uSource", velocity.read, 0);
        bindTexture(program, "uVelocity", velocity.read, 1);
        gl.uniform2f(getUniform(program, "uSourceTexel"), simTexel[0], simTexel[1]);
        gl.uniform2f(getUniform(program, "uVelocityTexel"), simTexel[0], simTexel[1]);
        gl.uniform1f(getUniform(program, "uDt"), dt);
        gl.uniform1f(getUniform(program, "uDissipation"), VELOCITY_DISSIPATION);
      });
      swap(velocity);

      draw(shaderPrograms.advect, dye.write, (program) => {
        bindTexture(program, "uSource", dye.read, 0);
        bindTexture(program, "uVelocity", velocity.read, 1);
        gl.uniform2f(getUniform(program, "uSourceTexel"), dyeTexel[0], dyeTexel[1]);
        gl.uniform2f(getUniform(program, "uVelocityTexel"), simTexel[0], simTexel[1]);
        gl.uniform1f(getUniform(program, "uDt"), dt);
        gl.uniform1f(getUniform(program, "uDissipation"), DENSITY_DISSIPATION);
      });
      swap(dye);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      draw(shaderPrograms.display, null, (program) => {
        bindTexture(program, "uDye", dye.read, 0);
        gl.uniform2f(getUniform(program, "uDyeTexel"), dyeTexel[0], dyeTexel[1]);
        gl.uniform1f(getUniform(program, "uOpacity"), SMOKE_OPACITY);
      });
    };

    const chooseColor = () => {
      const isGold = Math.random() < GOLD_SHARE;
      const base = isGold
        ? SMOKE_COLORS.gold
        : Math.random() < 0.57
          ? SMOKE_COLORS.burgundy
          : SMOKE_COLORS.crimson;
      const variation = 0.88 + Math.random() * 0.2;
      const intensity = isGold ? 0.42 : 1;
      return base.map((channel) => Math.min(1, channel * variation * intensity));
    };

    handlePointerMove = (event) => {
      if (
        (event.pointerType !== "mouse" && event.pointerType !== "pen") ||
        document.hidden
      ) {
        return;
      }
      const bounds = canvas.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        lastPointer = null;
        return;
      }

      const point = {
        x: (event.clientX - bounds.left) / bounds.width,
        y: 1 - (event.clientY - bounds.top) / bounds.height,
        time: event.timeStamp,
      };
      if (lastPointer) {
        const dx = point.x - lastPointer.x;
        const dy = point.y - lastPointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0) {
          const elapsed = Math.max(0.001, (point.time - lastPointer.time) / 1000);
          const speed = Math.min(1, Math.hypot(dx, dy) / elapsed / 1.4);
          const steps = Math.min(12, Math.max(1, Math.ceil(distance / 0.018)));
          for (let step = 1; step <= steps; step += 1) {
            const progress = step / steps;
            splats.push({
              x: lastPointer.x + dx * progress,
              y: lastPointer.y + dy * progress,
              dx: dx / steps,
              dy: dy / steps,
              color: chooseColor(),
              intensity: (0.04 + speed * 0.24) * (Math.random() * 0.16 + 0.92),
            });
          }
          if (splats.length > MAX_QUEUED_SPLATS) {
            splats.splice(0, splats.length - MAX_QUEUED_SPLATS);
          }
        }
      }
      lastPointer = point;
    };

    handleResize = () => {
      if (!resizeCanvas()) {
        simulation = null;
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const renderFrame = (timestamp) => {
      animationFrame = 0;
      if (document.hidden || stopped || !simulation) return;
      const deltaTime = lastFrameTime
        ? Math.min(1 / 30, Math.max(0.001, (timestamp - lastFrameTime) / 1000))
        : 1 / 60;
      lastFrameTime = timestamp;
      const bounds = canvas.getBoundingClientRect();
      simulate(deltaTime, bounds.width / bounds.height);
      animationFrame = window.requestAnimationFrame(renderFrame);
    };

    const startLoop = () => {
      if (!document.hidden && !animationFrame && simulation && !stopped) {
        lastFrameTime = 0;
        animationFrame = window.requestAnimationFrame(renderFrame);
      }
    };

    handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        lastFrameTime = 0;
      } else {
        startLoop();
      }
    };

    if (!resizeCanvas()) {
      cleanup();
      return undefined;
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    startLoop();
    return cleanup;
  }, []);

  return <canvas ref={canvasRef} className="smoke-trail" aria-hidden="true" />;
}

export default SmokeTrail;
