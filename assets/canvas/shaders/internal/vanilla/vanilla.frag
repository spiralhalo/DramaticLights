#include canvas:shaders/internal/header.glsl
#include canvas:shaders/internal/varying.glsl
#include canvas:shaders/internal/diffuse.glsl
#include canvas:shaders/internal/flags.glsl
#include canvas:shaders/internal/fog.glsl
#include frex:shaders/api/world.glsl
#include frex:shaders/api/player.glsl
#include frex:shaders/api/material.glsl
#include frex:shaders/api/fragment.glsl
#include frex:shaders/api/sampler.glsl
#include frex:shaders/lib/math.glsl
#include frex:shaders/lib/color.glsl

#include canvas:apitarget

/****** awoo edit *****/
#include awoo:shaders/routine/hazy.frag
#include awoo:shaders/routine/brightness_fog.frag
/****** END awoo edit *****/ 

/******************************************************
  canvas:shaders/internal/vanilla/vanilla.frag
  derived from Canvas commit 6e5280830ed9a0a51222aae7379ac82374546f87
******************************************************/

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

vec4 light(frx_FragmentData fragData) {
	#ifdef CONTEXT_IS_GUI
	return vec4(1.0, 1.0, 1.0, 1.0);
	#else
	#if DIFFUSE_SHADING_MODE == DIFFUSE_MODE_SKY_ONLY && defined(CONTEXT_IS_BLOCK)
	if (fragData.diffuse) {
		vec4 block = texture2D(frxs_lightmap, vec2(fragData.light.x, 0.03125));
		vec4 sky = texture2D(frxs_lightmap, vec2(0.03125, fragData.light.y));
		return max(block, sky * _cvv_diffuse);
	}
		#endif

	return texture2D(frxs_lightmap, fragData.light);
	#endif
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

	frx_startFragment(fragData);
	
	/****** awoo edit *****/
	awoo_hazy(fragData);
	/****** END awoo edit *****/ 

	vec4 raw = fragData.spriteColor * fragData.vertexColor;
	vec4 a = raw;

	#if SHADER_PASS == SHADER_PASS_DECAL
	if (a.a == 0) {
		discard;
	}
		#endif

	if (a.a >= 0.5 || _cv_getFlag(_CV_FLAG_CUTOUT) != 1.0) {
	
		/****** awoo edit *****/ 
		//a *= mix(light(fragData), frx_emissiveColor(), fragData.emissivity);
		#if AO_SHADING_MODE != AO_MODE_NONE && defined(CONTEXT_IS_BLOCK)
		vec4 calcAO = fragData.ao?(aoFactor(fragData.light)):vec4(1,1,1,1);
		#else
		vec4 calcAO = vec4(1,1,1,1);
		#endif
		
		#if DIFFUSE_SHADING_MODE == DIFFUSE_MODE_NORMAL
		float calcDiff = fragData.diffuse?(_cvv_diffuse + (1.0 - _cvv_diffuse) * fragData.emissivity):1;
		#else
		float calcDiff = 1;
		#endif
		
		awoo_brightnessFog(fragData, a, light(fragData), calcAO, calcDiff);

		/*#if AO_SHADING_MODE != AO_MODE_NONE && defined(CONTEXT_IS_BLOCK)
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
		/****** END awoo edit *****/ 
	} else {
		discard;
	}

	// TODO: need a separate fog pass?
	gl_FragData[TARGET_BASECOLOR] = _cv_fog(a);

	#if TARGET_EMISSIVE > 0
	gl_FragData[TARGET_EMISSIVE] = vec4(fragData.emissivity, 0.0, 0.0, 1.0);
	#endif
}
