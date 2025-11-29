// Overlay Blend Shader for Phaser 3
// Converted from Raylib GLSL shader blend_color.fs

export const OverlayBlendShader = {
    key: 'OverlayBlend',
    
    fragmentShader: `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec4 uTintColor;

varying vec2 outTexCoord;
varying vec4 outTint;

vec3 BlendOverlay(vec3 base, vec3 blend) {
    float red;
    float green;
    float blue;
    
    if (base.r < 0.5) {
        red = 2.0 * base.r * blend.r;
    } else {
        red = 1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r);
    }
    
    if (base.g < 0.5) {
        green = 2.0 * base.g * blend.g;
    } else {
        green = 1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g);
    }
    
    if (base.b < 0.5) {
        blue = 2.0 * base.b * blend.b;
    } else {
        blue = 1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b);
    }
    
    return vec3(red, green, blue);
}

void main() {
    vec4 base = texture2D(uMainSampler, outTexCoord);
    
    // Apply overlay blend
    vec3 final = BlendOverlay(base.rgb, uTintColor.rgb);
    gl_FragColor = vec4(final.rgb, base.a * uTintColor.a);
}
    `
};

// Usage in Phaser:
// 1. Load in preload():
//    this.load.glsl('overlayBlend', 'path/to/shader.glsl.js');
//
// 2. Create pipeline in create():
//    const pipeline = this.renderer.pipelines.get('OverlayBlend');
//    if (!pipeline) {
//        this.renderer.pipelines.add('OverlayBlend', new Phaser.Renderer.WebGL.Pipelines.SinglePipeline({
//            game: this.game,
//            renderer: this.renderer,
//            fragShader: OverlayBlendShader.fragmentShader
//        }));
//    }
//
// 3. Apply to sprite:
//    sprite.setPipeline('OverlayBlend');
//    sprite.setPipelineData('uTintColor', [r, g, b, a]);
