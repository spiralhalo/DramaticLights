float awoo_diffuse(in frx_FragmentData fragData) {

    if(!fragData.diffuse){
        return 1;
    }

    vec3 n = fragData.vertexNormal;
    #ifdef EXPERIMENTAL_PIPELINE
    n = n*frx_normalModelMatrix();
    #endif
    
    float bottom = dot(n, vec3(0,-1,0))*0.5+0.5;
    float sunWise = abs(dot(n, vec3(1,0,0)));
    float sunPerp = abs(dot(n, vec3(0,0,1)));
    
    #ifdef EXPERIMENTAL_PIPELINE
    float diff = frx_isSkyDarkened()?1:mix(1, 0.35, max(0,bottom - fragData.light.x * 0.5));
    #else
    float diff = mix(1, 0.35, max(0,bottom - fragData.light.x * 0.5));
    #endif
    diff = mix(diff, 0.65, sunPerp);
    diff = mix(diff, 0.4, sunWise);

    #if DIFFUSE_SHADING_MODE == DIFFUSE_MODE_SKY_ONLY
    diff = mix(diff, 1, fragData.light.x * 0.5);
    #endif

    return diff;
}