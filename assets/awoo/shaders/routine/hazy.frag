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

void awoo_hazy(inout frx_FragmentData fragData) {

	// sky light intensity
	float sky = clampScale(MIN_VANILLA_LIGHT, 1.0, fragData.light.y) * frx_ambientIntensity();

	// hazy "indoor" lighting effect
	float hazy = BLOCK_LIGHT_HAZE * frx_smootherstep(0.5, 1, max(0, fragData.light.x - sky));

	// apply hazy effect
	fragData.emissivity = max(fragData.emissivity, hazy);

	//fragData.emissivity = max(fragData.emissivity, nfx*0.2);
	
}