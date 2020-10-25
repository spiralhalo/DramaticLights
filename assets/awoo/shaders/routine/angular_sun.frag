#define ANGULAR_DELUMINATION        0.2
#define SUN_EXPOSURE_POWER          0.1
#define SUN_HAZE_CUTOFF             0.9
#define NOON_HAZE_EMISSIVITY        0.05
#define TWILIGHT_HAZE_EMISSIVITY    0.8
#define MORNING_TWILIGHT            0.5
#define AMBIENT_DARKNESS_CUTOFF     0.8
#define DEEP_DARKNESS_CUTOFF        0.5

#define MIN_SKY_LIGHT               0.03126

#define SUN_COLOR                   vec3(1.0, 1.0, 1.0)
#define TWILIGHT_COLOR              vec3(1.0, 0.5, 0.18)
#define DAY_AMBIENCE_COLOR          vec3(0.28, 0.89, 1.0)
#define NIGHT_AMBIENCE_COLOR        vec3(0.10, 0.10, 0.20)

float clampScale(float e0, float e1, float v){
    return clamp((v-e0)/(e1-e0), 0.0, 1.0);
}

vec4 rgbWithAlpha(float x, float a){
    return vec4(x, x, x, a);
}

void awoo_angularSun(inout frx_FragmentData fragData, inout vec4 a, vec4 lightCalc, vec4 aoFact, float diffuse) {

    vec4 darkenColorNoAO;
    if(frx_worldHasSkylight() && fragData.emissivity == 0){
        float fixedSkyLight = clampScale(MIN_SKY_LIGHT, 1.0, fragData.light.y);
        float ambientSkyInfluence = fixedSkyLight * frx_ambientIntensity();
        vec3 n = fragData.vertexNormal;
        #ifdef EXPERIMENTAL_PIPELINE
        n = n*frx_normalModelMatrix();
        #endif
        //vector projection
        float east = dot(n, vec3(1,0,0));
        float top = dot(n, vec3(0,1,0));
        float west = dot(n, vec3(-1,0,0));
        /*float south = dot(n, vec3(0,0,1));
        float north = dot(n, vec3(0,0,-1));
        float bottom = dot(n, vec3(0,-1,0));
        //color the corresponding face
        a *= vec4(east+bottom+north, top+north+west, west+bottom+south, 1);*/
        float time = frx_worldTime();
        float noonness = (time<0.25)?(frx_smootherstep(0.0, 0.25, time)):(frx_smootherstep(0.5, 0.25, time));
        float morningness = (time>0.92)?(frx_smootherstep(0.92, 1.0, time)):frx_smootherstep(0.25, 0.0, time);
        float eveningness = (time>0.5)?(frx_smootherstep(0.58, 0.5, time)):frx_smootherstep(0.25, 0.5, time);
        // TODO: deal with z axes? (annual sun "movement")
        float angularSunInfluence = fixedSkyLight*frx_smootherstep(0.0, 1.0, east * morningness + top * noonness * frx_ambientIntensity() + west * eveningness);

        float sunBleachedDiffuse = mix(diffuse, 1.0, angularSunInfluence);
        darkenColorNoAO = lightCalc * rgbWithAlpha(sunBleachedDiffuse, 1); // AO IS A BRO YOU DON'T MESS WITH IT >:(
        float luminanceNoAO = frx_luminance(darkenColorNoAO.rgb);
        float ambientDarkness = frx_smootherstep(AMBIENT_DARKNESS_CUTOFF, 0.0, luminanceNoAO)*ambientSkyInfluence;
        float sqrtAmbientDarkness = sqrt(ambientDarkness);
        float deepDarkness = frx_smootherstep(DEEP_DARKNESS_CUTOFF, 0.0, luminanceNoAO);
        //float inverseAmbience = frx_smootherstep(1.0, 0.0, ambientSkyInfluence);
        
        float mtf = 1.0-MORNING_TWILIGHT*ceil(morningness); //morning twilight factor
        float twilightness = (time>0.5?max(morningness,eveningness):frx_smootherstep(0.96, 1.0, max(morningness,eveningness)))*mtf;
        float twilightLumination = angularSunInfluence*twilightness;
        float twilightAmbience = twilightness*sqrtAmbientDarkness;
        
        float dayness = (time < 0.5)?(1-twilightness):0;
        float dayAmbience = dayness*ambientDarkness;
        float nightAmbience = (1-dayness)*deepDarkness*fixedSkyLight;
        
        float sunExposure = 1-ANGULAR_DELUMINATION+angularSunInfluence*ANGULAR_DELUMINATION+angularSunInfluence*SUN_EXPOSURE_POWER;
        float sunHaze = frx_smootherstep(SUN_HAZE_CUTOFF, 1.0, angularSunInfluence);
        float sunHazeEmissivity = sunHaze * noonness * NOON_HAZE_EMISSIVITY + sunHaze * twilightness * TWILIGHT_HAZE_EMISSIVITY;
        vec4 brightenColor = rgbWithAlpha(sunExposure, 1);

        darkenColorNoAO = vec4(mix(darkenColorNoAO.rgb, SUN_COLOR, angularSunInfluence), 1);
        darkenColorNoAO = vec4(mix(darkenColorNoAO.rgb, TWILIGHT_COLOR, twilightAmbience), 1);
        darkenColorNoAO = vec4(mix(darkenColorNoAO.rgb, DAY_AMBIENCE_COLOR, dayAmbience), 1);
        darkenColorNoAO = vec4(mix(darkenColorNoAO.rgb, NIGHT_AMBIENCE_COLOR, nightAmbience), 1);

        brightenColor = vec4(mix(brightenColor.rgb, TWILIGHT_COLOR, twilightLumination), 1);

        a *= brightenColor;
        fragData.emissivity = max(fragData.emissivity, sunHazeEmissivity);
    } else {
        darkenColorNoAO = lightCalc * rgbWithAlpha(diffuse, 1);
    }
	a *= darkenColorNoAO;
    a *= aoFact;
}