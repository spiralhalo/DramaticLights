#define ANGULAR_DELUMINATION        0.5
#define SUN_EXPOSURE_POWER          0.1
#define SUN_EXPOSURE_DESATURATION   0.1
#define TWILIGHT_LUMINATION         0.9
#define TWILIGHT_AMBIENT_RED        1.0
#define MORNING_TWILIGHT            0.5
#define AMBIENT_DARKNESS_CUTOFF     0.8
#define DEEP_DARKNESS_CUTOFF        0.5
#define DEEP_DARKNESS_DESATURATION  0.02
#define DAY_AMBIENT_GREEN           1.5
#define DAY_AMBIENT_BLUE            2.0
#define DARKNESS_BLUE               0.8

vec4 rgbWithAlpha(float x, float a){
    return vec4(x, x, x, a);
}

void awoo_angularSun(inout frx_FragmentData fragData, inout vec4 a, vec4 lightCalc, vec4 aoFact, float diffuse) {
	
    /*vec3 normalColor = fragData.vertexNormal;
    if(normalColor.r < 0){
        normalColor = vec3(1,0,1);
    } else if(normalColor.g < 0){
        normalColor = vec3(1,1,0);
    } else if(normalColor.b < 0){
        normalColor = vec3(0,1,1);
    }
    a *= vec4(normalColor, 1);*/

    //TO TASTE
    //float sunExposurePower = 0.1;
    //float sunExposureDesaturation = 0.1;
    //float deepDarkness

    float ambientSkyInfluence = fragData.light.y * frx_ambientIntensity();
    vec3 n = fragData.vertexNormal;
    float time = frx_worldTime();
    float noonness = (time<0.25)?(frx_smootherstep(0.0, 0.25, time)):(frx_smootherstep(0.5, 0.25, time));
    float morningness = (time>0.92)?(frx_smootherstep(0.92, 1.0, time)):frx_smootherstep(0.25, 0.0, time);
    float eveningness = (time>0.5)?(frx_smootherstep(0.58, 0.5, time)):frx_smootherstep(0.25, 0.5, time);
    // TODO: deal with z faces and diagonal faces as well
    float angularSunInfluence = fragData.light.y*frx_smootherstep(-1.0, 1.0, n.x * morningness + n.y * noonness + (-n.x * eveningness));

    float influencedDiffuse = max(diffuse,mix(diffuse, angularSunInfluence, 0.5));
    vec4 brightnessColor = lightCalc * aoFact * rgbWithAlpha(influencedDiffuse, 1);
    vec4 brightnessColorNoAO = lightCalc * rgbWithAlpha(influencedDiffuse, 1); // AO IS A BRO YOU DON'T MESS WITH IT >:(
    float luminanceNoAO = frx_luminance(brightnessColorNoAO.rgb);
    float ambientDarkness = frx_smootherstep(AMBIENT_DARKNESS_CUTOFF, 0.0, luminanceNoAO)*ambientSkyInfluence;
    float deepDarkness = frx_smootherstep(DEEP_DARKNESS_CUTOFF, 0.0, luminanceNoAO);
    float inverseAmbience = frx_smootherstep(1.0, 0.0, ambientSkyInfluence);
    
    float mtf = 1.0-(1.0-0.96)*MORNING_TWILIGHT; //morning twilight factor
    float twilightness = (time>0.5)?(max(morningness*mtf,eveningness)):frx_smootherstep(0.96, 1.0, max(morningness*mtf,eveningness));
    float twilightLumination = angularSunInfluence*twilightness*TWILIGHT_LUMINATION;
    float twilightAmbient = twilightness*ambientDarkness;
    
    float dayness = (time < 0.5)?(1-twilightness):0;
    float dayAmbient = dayness*ambientDarkness;
    
    float sunExposure = -0.5*ANGULAR_DELUMINATION+angularSunInfluence*ANGULAR_DELUMINATION+angularSunInfluence*SUN_EXPOSURE_POWER;

	a *= brightnessColor;
    a *= vec4(1+sunExposure+twilightLumination, 1+sunExposure, 1+sunExposure, 1);
    a *= vec4(1+twilightAmbient*TWILIGHT_AMBIENT_RED, 1+dayAmbient*DAY_AMBIENT_GREEN, 1+dayAmbient*DAY_AMBIENT_BLUE, 1);
    a.b *= (1+deepDarkness*DARKNESS_BLUE*inverseAmbience);
    a += rgbWithAlpha(angularSunInfluence*SUN_EXPOSURE_DESATURATION+deepDarkness*DEEP_DARKNESS_DESATURATION, 0);
}