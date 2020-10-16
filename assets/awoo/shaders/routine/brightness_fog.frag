void awoo_brightnessFog(inout frx_FragmentData fragData, inout vec4 a, vec4 lx, float sfaox, float dix) {

	a *= mix(lx, frx_emissiveColor(), fragData.emissivity);

	float bfx = frx_smootherstep(1.0, 0.0, frx_luminance(lx.rgb) * dix);
	float dbfx = frx_smootherstep(0.5, 0.0, frx_luminance(lx.rgb) * dix * sfaox * sfaox);
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

	// brighten ONLY very bright areas
	a.r *= (1+nfx*0.15);
	a.g *= (1+nfx*0.15);
	a.b *= (1+nfx*0.15);
	// a.r *= (1+max(nfx*0.15,bfx*0.1));
	// a.g *= (1+max(nfx*0.15,bfx*0.1));
	// a.b *= (1+max(nfx*0.15,bfx*0.1));

	// lower saturation on very dark or very bright areas
	a += vec4(max(nfx*0.2, bfx*0.02), max(nfx*0.2, bfx*0.02), max(nfx*0.2, bfx*0.04), 0);

	// red shadow fog, outdoors during dusk and dawn
	a.r *= (1+dfx*bfx*ssa*0.8);

	// green shadow fog, outdoors during the day
	a.g *= (1+max(0,bfx*six-dfx*ssa)*0.8);

	// blue shadow fog, outdoors at all times, nerfed indoors
	a.b *= (1+max(0,max(dbfx, bfx*six)/**(1-six)*/-dfx*ssa)*0.6);
	
}