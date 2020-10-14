#include frex:shaders/api/fragment.glsl
#include frex:shaders/api/world.glsl
#include frex:shaders/api/camera.glsl
#include frex:shaders/lib/math.glsl

void frx_startFragment(inout frx_FragmentData fragData) {
	/*
	float sky = fragData.light.y * frx_ambientIntensity();
	float bloom = 0.4 * frx_smootherstep(0.5, 1, max(fragData.light.x, sky));
	*/
	
	/*
	float bloom = frx_smootherstep(0.5, 1, max(0, fragData.light.x - 0.2 * fragData.light.y * frx_ambientIntensity()));
	fragData.spriteColor.r += 1 * bloom;
	*/
	
	/*
	float bloom = 0.5 * frx_smootherstep(0.5, 1, max(0, fragData.light.x - fragData.light.y * frx_ambientIntensity()));
	fragData.emissivity = max(fragData.emissivity, bloom);
	*/
	
	/*
	float bloom = frx_smootherstep(0.5, 1, max(0, fragData.light.x - 0.2 * fragData.light.y * frx_ambientIntensity()));
	fragData.spriteColor.rgb += frx_entityView() * bloom;*/
}
