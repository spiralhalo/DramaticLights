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

// #define SR_AM   0.1875
// #define SS_PM   0.3375
// #define TW_DR   0.046875

void awoo_angularSun(inout frx_FragmentData fragData, inout vec4 a, vec4 lightCalc, vec4 aoFact, float diffuse) {

    if(frx_worldHasSkylight()){

        vec3 normal = fragData.vertexNormal;
        #ifdef EXPERIMENTAL_PIPELINE
        normal = normal*frx_normalModelMatrix();
        #endif

        float time   = frx_worldTime();
        vec3 sunDir = gg_sunDir(time);
        float fixedSkyLight = clampScale(MIN_SKY_LIGHT, 1.0, fragData.light.y);
        float ambientIntensity = frx_ambientIntensity();
        float weatherClearness = mix(1.0, ambientIntensity, frx_rainGradient());

        // TODO: deal with z axes? (annual sun "movement")
        float angularSunInfluence = max(0,fixedSkyLight*weatherClearness*dot(sunDir, normal));

        float sunBleachedDiffuse = mix(diffuse, 1.0, angularSunInfluence*ambientIntensity);
        vec3 darkenColorNoAO = lightCalc.rgb * sunBleachedDiffuse; // AO IS A BRO YOU DON'T MESS WITH IT >:(
        float luminanceNoAO = frx_luminance(darkenColorNoAO);
        float ambientDarkness = sqrt(frx_smootherstep(AMBIENT_DARKNESS_CUTOFF, 0.0, luminanceNoAO))*weatherClearness;
        float deepDarkness = frx_smootherstep(DEEP_DARKNESS_CUTOFF, 0.0, luminanceNoAO);
        //float inverseAmbience = frx_smootherstep(1.0, 0.0, ambientSkyInfluence);
        
        // float timeAM = time<0.25 ? time+0.25 : time-0.75;
        // float timePM = time<0.75 ? time-0.25 : time-1.25;
        // float dawnness = timeAM < SR_AM+TW_DR ? frx_smootherstep(SR_AM, SR_AM+TW_DR, timeAM)*MORNING_TWILIGHT :
        //                 frx_smootherstep(SR_AM+TW_DR*2, SR_AM+TW_DR, timeAM)*MORNING_TWILIGHT;
        // float duskness = timePM < SS_PM-TW_DR ? frx_smootherstep(SS_PM-TW_DR*2, SS_PM-TW_DR, timePM) :
        //                 frx_smootherstep(SS_PM, SS_PM-TW_DR, timePM);
        float dawnness = time > 0.96 ? frx_smootherstep(0.96,1,time) : frx_smootherstep(0.04,0,time);
        float duskness = time < 0.5 ? frx_smootherstep(0.48,0.5,time) : frx_smootherstep(0.54,0.5,time);
        float twilightness = dawnness + duskness;
        float twilightLumination = angularSunInfluence*twilightness*ambientIntensity*TWILIGHT_LUMINATION;
        float twilightAmbience = twilightness*fixedSkyLight*ambientIntensity*TWILIGHT_AMBIENT_INTENSITY;
        
        float dayness = (time < 0.5)?(1-twilightness):0;
        float dayAmbience = dayness*ambientDarkness*fixedSkyLight*ambientIntensity;
        float nightAmbience = (1-dayness)*deepDarkness*fixedSkyLight;
        
        float sunExposure = 1-ANGULAR_DELUMINATION+angularSunInfluence*ANGULAR_DELUMINATION+angularSunInfluence*SUN_EXPOSURE_POWER;
        float noonness = max(0, angularSunInfluence * normal.y);
        float sunHaze = frx_smootherstep(SUN_HAZE_CUTOFF, 1.0, angularSunInfluence);
        float sunHazeEmissivity = sunHaze * noonness * NOON_HAZE_EMISSIVITY + sunHaze * twilightness * TWILIGHT_HAZE_EMISSIVITY;
        vec3 brightenColor = vec3(sunExposure);

        darkenColorNoAO = mix(darkenColorNoAO, SUN_COLOR, angularSunInfluence);
        darkenColorNoAO = mix(darkenColorNoAO, TWILIGHT_COLOR, twilightAmbience);
        darkenColorNoAO = mix(darkenColorNoAO, DAY_AMBIENCE_COLOR, dayAmbience);
        darkenColorNoAO = mix(darkenColorNoAO, NIGHT_AMBIENCE_COLOR, nightAmbience);
        darkenColorNoAO = mix(darkenColorNoAO, frx_emissiveColor().rgb, fragData.emissivity);

        brightenColor = mix(brightenColor, TWILIGHT_COLOR, twilightLumination);
        brightenColor = mix(brightenColor, frx_emissiveColor().rgb, fragData.emissivity);

        a *= vec4(brightenColor, 1.0);
        a *= vec4(darkenColorNoAO, lightCalc.a);
        a *= aoFact;

        // if (AMBIENT_FOG_ENABLED){
        //     float fogness = frx_smootherstep(FOG_NEAR, FOG_FAR, length(_awoov_viewPos.xz));
        //     vec3 fogColor = DAY_FOG_COLOR;
        //     fogColor = mix(fogColor, TWILIGHT_COLOR, twilightness);
        //     fogColor = mix(fogColor, NIGHT_AMBIENCE_COLOR, max(0,1-dayness-twilightness));

        //     a = mix(a, vec4(fogColor, 1.0), fogness);

        //     sunHazeEmissivity = max(0, sunHazeEmissivity-fogness);
        // }

        fragData.emissivity = max(fragData.emissivity, sunHazeEmissivity);
    } else {
        a *= lightCalc * rgbWithAlpha(diffuse, 1) * aoFact;
    }
}