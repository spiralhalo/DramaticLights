void awoo_hazy(inout frx_FragmentData fragData) {

	// sky light intensity
	float sky = fragData.light.y * frx_ambientIntensity();

	// hazy "indoor" lighting effect
	float hazy = 0.5 * frx_smootherstep(0.5, 1, max(0, fragData.light.x - sky));

	// apply hazy effect
	fragData.emissivity = max(fragData.emissivity, hazy);

	//fragData.emissivity = max(fragData.emissivity, nfx*0.2);
	
}