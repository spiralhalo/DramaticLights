/*
    Dramatic Lights Shaders for Canvas
    Copyright (C) 2020  spiralhalo

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

void awoo_brightnessFog(inout frx_FragmentData fragData, inout vec4 a, vec4 lightCalc, vec4 aoFact, float diffuse) {
	
	a *= lightCalc;
	//don't use AO for now because entity blocks don't have them (i.e. sign, maybe beds, etc)
	//float sfaox = fragData.ao?((frx_luminance(aoFact.rgb * aoFact.a)+1)/2):1;
	
	// entity blocks DO have Diffuse but they have different values than terrain blocks >:(
	// note to self: grass and ladders don't have diffuse at all.. interesting.. maybe all "flat" objects dont have diffuse
	float dix = fragData.diffuse?(diffuse + (1.0 - diffuse) * fragData.emissivity):1;

	float bfx = frx_smootherstep(1.0, 0.0, frx_luminance(lightCalc.rgb) * dix);
	float dbfx = frx_smootherstep(0.5, 0.0, frx_luminance(lightCalc.rgb) * dix);
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
	
	a *= aoFact;
	a *= vec4(diffuse, diffuse, diffuse, 1.0);
}