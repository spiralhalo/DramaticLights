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

#include awoo:settings.glsl

// Magic number
#define MIN_SKY_LIGHT               0.03125

varying vec3 _awoov_viewPos;

// Linear "step"
// For sky detection it makes sure that some ambient light seep into caves.
// For time transition (dawn -> morning -> noon, etc) it has weaker peaks,
// so smootherstep is the better choice.
float clampScale(float e0, float e1, float v){
    return clamp((v-e0)/(e1-e0), 0.0, 1.0);
}

vec4 rgbWithAlpha(float x, float a){
    return vec4(x, x, x, a);
}

void awoo_angularSun(inout frx_FragmentData fragData, inout vec4 a, vec4 lightCalc, vec4 aoFact, float diffuse) {

    if(frx_worldHasSkylight()){

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

        float fixedSkyLight = clampScale(MIN_SKY_LIGHT, 1.0, fragData.light.y);
        float ambientIntensity = frx_ambientIntensity();
        float ambientSkyInfluence = fixedSkyLight * ambientIntensity;
        float weatherClearness = mix(1.0, ambientIntensity, frx_rainGradient());

        // TODO: deal with z axes? (annual sun "movement")
        float angularSunInfluence = fixedSkyLight*weatherClearness*frx_smootherstep(0.0, 1.0, east * morningness + top * noonness + west * eveningness);

        float sunBleachedDiffuse = mix(diffuse, 1.0, angularSunInfluence);
        vec3 darkenColorNoAO = lightCalc.rgb * sunBleachedDiffuse; // AO IS A BRO YOU DON'T MESS WITH IT >:(
        float luminanceNoAO = max(frx_luminance(darkenColorNoAO), fragData.emissivity);
        float ambientDarkness = sqrt(frx_smootherstep(AMBIENT_DARKNESS_CUTOFF, 0.0, luminanceNoAO))*weatherClearness;
        float deepDarkness = frx_smootherstep(DEEP_DARKNESS_CUTOFF, 0.0, luminanceNoAO);
        //float inverseAmbience = frx_smootherstep(1.0, 0.0, ambientSkyInfluence);
        
        float mtf = morningness>0?MORNING_TWILIGHT:1; //morning twilight factor
        float twilightness = (time>0.5?max(morningness,eveningness):frx_smootherstep(0.96, 1.0, max(morningness,eveningness)))*mtf;
        float twilightLumination = angularSunInfluence*twilightness*0.5;
        float twilightAmbience = min(twilightness*fixedSkyLight, 1-fragData.emissivity);
        
        float dayness = (time < 0.5)?(1-twilightness):0;
        float dayAmbience = dayness*ambientDarkness*ambientSkyInfluence;
        float nightAmbience = (1-dayness)*deepDarkness*fixedSkyLight;
        
        float sunExposure = 1-ANGULAR_DELUMINATION+angularSunInfluence*ANGULAR_DELUMINATION+angularSunInfluence*SUN_EXPOSURE_POWER;
        float sunHaze = frx_smootherstep(SUN_HAZE_CUTOFF, 1.0, angularSunInfluence);
        float sunHazeEmissivity = sunHaze * noonness * NOON_HAZE_EMISSIVITY + sunHaze * twilightness * TWILIGHT_HAZE_EMISSIVITY;
        vec3 brightenColor = vec3(sunExposure);

        darkenColorNoAO = mix(darkenColorNoAO, SUN_COLOR, angularSunInfluence);
        darkenColorNoAO = mix(darkenColorNoAO, TWILIGHT_COLOR, twilightAmbience);
        darkenColorNoAO = mix(darkenColorNoAO, DAY_AMBIENCE_COLOR, dayAmbience);
        darkenColorNoAO = mix(darkenColorNoAO, NIGHT_AMBIENCE_COLOR, nightAmbience);

        brightenColor = mix(brightenColor, TWILIGHT_COLOR, twilightLumination);

        a *= vec4(brightenColor, 1.0);
        a *= vec4(darkenColorNoAO, lightCalc.a);
        a *= aoFact;

        if (AMBIENT_FOG_ENABLED){
            float fogness = frx_smootherstep(FOG_NEAR, FOG_FAR, length(_awoov_viewPos.xz));
            vec3 fogColor = DAY_FOG_COLOR;
            fogColor = mix(fogColor, TWILIGHT_COLOR, twilightness);
            fogColor = mix(fogColor, NIGHT_AMBIENCE_COLOR, max(0,1-dayness-twilightness));

            a = mix(a, vec4(fogColor, 1.0), fogness);

            sunHazeEmissivity = max(0, sunHazeEmissivity-fogness);
        }

        fragData.emissivity = max(fragData.emissivity, sunHazeEmissivity);
    } else {
        a *= lightCalc * rgbWithAlpha(diffuse, 1) * aoFact;
    }
}