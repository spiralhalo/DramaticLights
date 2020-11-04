#include canvas:shaders/wip/header.glsl
#include canvas:shaders/wip/varying.glsl
#include canvas:shaders/wip/diffuse.glsl
#include canvas:shaders/wip/flags.glsl
#include canvas:shaders/wip/fog.glsl
#include frex:shaders/wip/api/world.glsl
#include frex:shaders/wip/api/player.glsl
#include frex:shaders/wip/api/material.glsl
#include frex:shaders/wip/api/fragment.glsl
#include frex:shaders/wip/api/sampler.glsl
#include frex:shaders/lib/math.glsl
#include frex:shaders/lib/color.glsl
#include canvas:shaders/wip/program.glsl

#include canvas:apitarget

/****** spiralhalo's edit *****/
#define EXPERIMENTAL_PIPELINE
#include awoo:shaders/lib/skydir.glsl
#include awoo:settings.glsl
#include awoo:shaders/common.frag
#include awoo:shaders/routine/hazy.frag
#include awoo:shaders/routine/angular_sun.frag
/****** END spiralhalo's edit *****/ 

/******************************************************
  canvas:shaders/internal/material_main.frag
******************************************************/

void _cv_startFragment(inout frx_FragmentData data) {
	int cv_programId = _cv_fragmentProgramId();

#include canvas:startfragment
}

#if AO_SHADING_MODE != AO_MODE_NONE
vec4 aoFactor(vec2 lightCoord) {
	float ao = _cvv_ao;

#if AO_SHADING_MODE == AO_MODE_SUBTLE_BLOCK_LIGHT || AO_SHADING_MODE == AO_MODE_SUBTLE_ALWAYS
	// accelerate the transition from 0.4 (should be the minimum) to 1.0
	float bao = (ao - 0.4) / 0.6;
	bao = clamp(bao, 0.0, 1.0);
	bao = 1.0 - bao;
	bao = bao * bao * (1.0 - lightCoord.x * 0.6);
	bao = 0.4 + (1.0 - bao) * 0.6;

	#if AO_SHADING_MODE == AO_MODE_SUBTLE_ALWAYS
	return vec4(bao, bao, bao, 1.0);
	#else
	vec4 sky = texture2D(frxs_lightmap, vec2(0.03125, lightCoord.y));
	ao = mix(bao, ao, frx_luminance(sky.rgb));
	return vec4(ao, ao, ao, 1.0);
	#endif
#else
	return vec4(ao, ao, ao, 1.0);
#endif
}
#endif

vec4 light(frx_FragmentData fragData) {
#if DIFFUSE_SHADING_MODE == DIFFUSE_MODE_SKY_ONLY
	if (fragData.diffuse) {
		vec4 block = texture2D(frxs_lightmap, vec2(fragData.light.x, 0.03125));
		vec4 sky = texture2D(frxs_lightmap, vec2(0.03125, fragData.light.y));
		return max(block, sky * _cvv_diffuse);
	}
#endif

	return texture2D(frxs_lightmap, fragData.light);
}

void main() {
	frx_FragmentData fragData = frx_FragmentData (
	texture2D(frxs_spriteAltas, _cvv_texcoord, _cv_getFlag(_CV_FLAG_UNMIPPED) * -4.0),
	_cvv_color,
	frx_matEmissive() ? 1.0 : 0.0,
	!frx_matDisableDiffuse(),
	!frx_matDisableAo(),
	_cvv_normal,
	_cvv_lightcoord
	);

	_cv_startFragment(fragData);

	/****** spiralhalo's edit *****/
	awoo_hazy(fragData);
	/****** END spiralhalo's edit *****/ 

	vec4 raw = fragData.spriteColor * fragData.vertexColor;
	vec4 a = raw;

	// PERF: varyings better here?
	if (_cv_getFlag(_CV_FLAG_CUTOUT) == 1.0) {
		float t = _cv_getFlag(_CV_FLAG_TRANSLUCENT_CUTOUT) == 1.0 ? _CV_TRANSLUCENT_CUTOUT_THRESHOLD : 0.5;

		if (a.a < t) {
			discard;
		}
	}

	/****** spiralhalo's edit *****/ 
	vec4 lightCalc = mix(light(fragData), frx_emissiveColor(), fragData.emissivity);

	#if AO_SHADING_MODE != AO_MODE_NONE
	vec4 calcAO = fragData.ao?(aoFactor(fragData.light)):vec4(1,1,1,1);
	#else
	vec4 calcAO = vec4(1,1,1,1);
	#endif
	
	#if DIFFUSE_SHADING_MODE == DIFFUSE_MODE_NORMAL
	float calcDiff = fragData.diffuse?(_cvv_diffuse + (1.0 - _cvv_diffuse) * fragData.emissivity):1;
	#else
	float calcDiff = 1;
	#endif
	
	awoo_angularSun(fragData, a, lightCalc, calcAO, calcDiff);
	//a *= mix(light(fragData), frx_emissiveColor(), fragData.emissivity);
/*
#if AO_SHADING_MODE != AO_MODE_NONE
	if (fragData.ao) {
		a *= aoFactor(fragData.light);
	}
#endif

#if DIFFUSE_SHADING_MODE == DIFFUSE_MODE_NORMAL
	if (fragData.diffuse) {
		float df = _cvv_diffuse + (1.0 - _cvv_diffuse) * fragData.emissivity;

		a *= vec4(df, df, df, 1.0);
	}
#endif
*/
	/****** END spiralhalo's edit *****/ 

	// PERF: varyings better here?
	if (_cv_getFlag(_CV_FLAG_FLASH_OVERLAY) == 1.0) {
		a = a * 0.25 + 0.75;
	} else if (_cv_getFlag(_CV_FLAG_HURT_OVERLAY) == 1.0) {
		a = vec4(0.25 + a.r * 0.75, a.g * 0.75, a.b * 0.75, a.a);
	}

	// TODO: need a separate fog pass?
	gl_FragData[TARGET_BASECOLOR] = _cv_fog(a);
	gl_FragDepth = gl_FragCoord.z;

#if TARGET_EMISSIVE > 0
	gl_FragData[TARGET_EMISSIVE] = vec4(fragData.emissivity, 0.0, 0.0, 1.0);
#endif
}
