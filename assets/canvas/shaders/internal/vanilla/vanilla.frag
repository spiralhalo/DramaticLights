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
	
	/**************************************
		START HAZY TORCHES CODE
	**************************************/	
	
	// sky light intensity
	float sky = fragData.light.y * frx_ambientIntensity();
	
	// hazy "indoor" lighting effect
	float hazy = 0.5 * frx_smootherstep(0.5, 1, max(0, fragData.light.x - sky));
	
	// apply hazy effect
	fragData.emissivity = max(fragData.emissivity, hazy);
	
	//fragData.emissivity = max(fragData.emissivity, nfx*0.2);
	
	/**************************************
		END HAZY TORCHES CODE
	**************************************/	

	vec4 raw = fragData.spriteColor * fragData.vertexColor;
	vec4 a = raw;

	#if SHADER_PASS == SHADER_PASS_DECAL
	if (a.a == 0) {
		discard;
	}
		#endif

	if (a.a >= 0.5 || _cv_getFlag(_CV_FLAG_CUTOUT) != 1.0) {
	
		//a *= mix(light(fragData), frx_emissiveColor(), fragData.emissivity);
		
	/**************************************
		START BRIGHTNESS FOG CODE
	**************************************/	
	
	vec4 lx = light(fragData);
	a *= mix(lx, frx_emissiveColor(), fragData.emissivity);
	
	// isolated blue fog routine
	float sfaox = 1; // softened ao factor
	if (fragData.ao) {
		sfaox = (frx_luminance(aoFactor(fragData.light).rgb)+1)/2;
	}
	
	float dix = 1;
	if (fragData.diffuse) {
		dix = _cvv_diffuse + (1.0 - _cvv_diffuse) * fragData.emissivity;
	}
	
	float bfx = frx_smootherstep(1.0, 0.0, frx_luminance(lx.rgb) * dix);
	float six = fragData.light.y * frx_ambientIntensity();
	float ssa = fragData.light.y;
	
	// dusk and dawn transition
	float dfx = 0;
	
	// finding these numbers require hours of testing >:(
	float m_start = 0.925;
	float m_peak = 0.970;
	float m_end = 0.995;
	float n_start = 0.45;
	float n_peak = 0.5;
	float n_end = 0.55;
	
	if(frx_worldTime() > m_start && frx_worldTime() < m_peak) {
		dfx = smoothstep(m_start, m_peak, frx_worldTime());
	} else if (frx_worldTime() >= m_peak && frx_worldTime() < m_end) {
		dfx = smoothstep(m_end, m_peak,frx_worldTime());
	} else if (frx_worldTime() > n_start && frx_worldTime() < n_peak) {
		dfx = smoothstep(n_start, n_peak,frx_worldTime());
	} else if (frx_worldTime() >= n_peak && frx_worldTime() < n_end) {
		dfx = smoothstep(n_end, n_peak,frx_worldTime());
	}
	
	// noon fog softener (peak at noon)
	float nix = 0;
	float d_start = 0;
	float d_peak_start = 0.175;
	float d_peak_end = 0.325;
	float d_end = 0.45;
	
	if(frx_worldTime() > d_start && frx_worldTime() < d_peak_start) {
		nix = smoothstep(d_start, d_peak_start, frx_worldTime());
	} else if (frx_worldTime() >= d_peak_end && frx_worldTime() < d_end) {
		nix = smoothstep(d_end, d_peak_end,frx_worldTime());
	} else if (frx_worldTime() >= d_peak_start && frx_worldTime() < d_peak_end){
		nix = 1;
	}
	
	// noon fog factor (by taste)
	float nfc = 0.8;
	float nfx = frx_smootherstep(0.93, 1.0, six * (1-bfx)) * nix * nfc;
	
	// brighten very dark or very bright areas
	a.r *= (1+max(nfx*0.15,bfx*0.1));
	a.g *= (1+max(nfx*0.15,bfx*0.1));
	a.b *= (1+max(nfx*0.15,bfx*0.1));
	
	// lower saturation on very dark or very bright areas
	a += vec4(max(nfx*0.2, bfx*0.03), max(nfx*0.2, bfx*0.03), max(nfx*0.2, bfx*0.04), 0);
	
	// red fog, outdoors during dusk and dawn
	a.r *= (1+dfx*bfx*ssa*0.8);
	
	// green fog, outdoors during the day
	a.g *= (1+max(0,bfx*six-dfx*ssa)*0.6);
	
	// blue fog, only indoor or at night
	a.b *= (1+max(0,bfx/**(1-six)*/-dfx*ssa)*0.6);

	/**************************************
		END BRIGHTNESS FOG CODE
	**************************************/	
		
		
		/**************************************
			OLD AWOO CODE
		**************************************/	
		/*
		// perceived light calculation (based on screen brightness, night vision, etc)
		vec4 lx = light(fragData);
		a *= mix(lx, frx_emissiveColor(), fragData.emissivity);
	
		// whether block is dark ("blue fog")
		//float bfx = frx_smootherstep(1.0, 0.0, max(fragData.light.x, sky));
		
		// noon fog
		float nfx = frx_smootherstep(0.9, 1.0, sky);
		
		// sky access
		// float sa = frx_smootherstep(0.9, 1.0, fragData.light.y);
		float sa = frx_smootherstep(0.0, 1.0, fragData.light.y); // smooooooooooth
		
		// whether it is dawn or dusk ("dusk fog")
		float dfx = 0;
		if(frx_worldTime() > 0.85) {
			dfx = smoothstep(0.85,1.0,frx_worldTime());
		} else if (frx_worldTime() < 0.05) {
			dfx = smoothstep(0.05,0.0,frx_worldTime());
		} else if (frx_worldTime() > 0.45 && frx_worldTime() < 0.5) {
			dfx = smoothstep(0.45,0.5,frx_worldTime());
		} else if (frx_worldTime() >= 0.5 && frx_worldTime() < 0.55) {
			dfx = smoothstep(0.55,0.5,frx_worldTime());
		}
		
		// add noon fog
		a.r *= (1+nfx/8);
		a.g *= (1+nfx/8);
		a.b *= (1+nfx/8);
		a += vec4(nfx*0.02, nfx*0.02, nfx*0.02, 0);
		
		// new bfx implementation (bad)
		// float bfx = frx_smootherstep(0.5, 0.0, frx_luminance(a.rgb));
		// new bfx implementation
		float bfx = frx_smootherstep(1.0, 0.0, frx_luminance(lx.rgb));
		
		// add blue fog
		//a += vec4(bfx*0.03, bfx*0.03, bfx*0.03, 0);
		// brighten dark areas
		a.r *= (1+max(0,bfx-dfx*sa)*0.5);
		a.g *= (1+max(0,bfx-dfx*sa)*0.5);
		a.b *= (1+max(0,bfx-dfx*sa)*0.5);
		// lower saturation on dark areas
		a += vec4(bfx*0.03, bfx*0.03, bfx*0.03, 0);
		// more greenish blue during the day
		a.g *= (1+max(0,bfx-dfx*sa)*nfx*0.3);
		// blue fog, only indoor or at night and during times beside dawn or dusk
		a.b *= (1+max(0,bfx*(1-sky)-dfx*sa)*0.6);
		
		// add dusk fog
		a.r *= (1+dfx*0.8*bfx*sa);
		*/
		/**************************************
			END OLD AWOO CODE
		**************************************/	

		#if AO_SHADING_MODE != AO_MODE_NONE && defined(CONTEXT_IS_BLOCK)
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
	} else {
		discard;
	}

	// TODO: need a separate fog pass?
	gl_FragData[TARGET_BASECOLOR] = _cv_fog(a);

	#if TARGET_EMISSIVE > 0
	gl_FragData[TARGET_EMISSIVE] = vec4(fragData.emissivity, 0.0, 0.0, 1.0);
	#endif
}
