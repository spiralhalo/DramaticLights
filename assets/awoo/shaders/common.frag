// Magic number
#define MIN_VANILLA_LIGHT   0.03125

varying vec3 _awoov_worldPos;
varying vec3 _awoov_viewPos;

// Linear "step"
// For sky detection it makes sure that some ambient light seep into caves.
// For time transition (dawn -> morning -> noon, etc) it has weaker peaks,
// so smootherstep is the better choice.
float clampScale(float e0, float e1, float v){
    return clamp((v-e0)/(e1-e0), 0.0, 1.0);
}

vec4 rgbWithAlpha(float x, float a){
    return vec4(x, x, x, a);
}