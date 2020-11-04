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
        float luminanceNoAO = frx_luminance(darkenColorNoAO);
        float ambientDarkness = sqrt(frx_smootherstep(AMBIENT_DARKNESS_CUTOFF, 0.0, luminanceNoAO))*weatherClearness;
        float deepDarkness = frx_smootherstep(DEEP_DARKNESS_CUTOFF, 0.0, luminanceNoAO);
        //float inverseAmbience = frx_smootherstep(1.0, 0.0, ambientSkyInfluence);
        
        float mtf = morningness>0?MORNING_TWILIGHT:1; //morning twilight factor
        float twilightness = (time>0.5?max(morningness,eveningness):frx_smootherstep(0.96, 1.0, max(morningness,eveningness)))*mtf;
        float twilightLumination = angularSunInfluence*twilightness*0.5;
        float twilightAmbience = twilightness*fixedSkyLight;
        
        float dayness = (time < 0.5)?(1-twilightness):0;
        float dayAmbience = dayness*ambientDarkness*ambientSkyInfluence;
        float nightAmbience = (1-dayness)*deepDarkness*fixedSkyLight;
        
        float sunExposure = 1+angularSunInfluence*SUN_EXPOSURE_POWER;
        float sunHaze = frx_smootherstep(SUN_HAZE_CUTOFF, 1.0, angularSunInfluence);
        float sunHazeEmissivity = sunHaze * noonness * NOON_HAZE_EMISSIVITY + sunHaze * twilightness * TWILIGHT_HAZE_EMISSIVITY;
        vec3 sunExposureColor = vec3(sunExposure);

        darkenColorNoAO = mix(darkenColorNoAO, SUN_COLOR, angularSunInfluence);
        darkenColorNoAO = mix(darkenColorNoAO, TWILIGHT_COLOR, twilightAmbience);
        darkenColorNoAO = mix(darkenColorNoAO, DAY_AMBIENCE_COLOR * DAY_AMBIENCE_INTENSITY, dayAmbience);
        darkenColorNoAO = mix(darkenColorNoAO, NIGHT_AMBIENCE_COLOR, nightAmbience);
        darkenColorNoAO = mix(darkenColorNoAO, frx_emissiveColor().rgb, fragData.emissivity);

        sunExposureColor = mix(sunExposureColor, TWILIGHT_COLOR, twilightLumination);
        sunExposureColor = mix(sunExposureColor, frx_emissiveColor().rgb, fragData.emissivity);

        a *= vec4(sunExposureColor, 1.0);
        a *= vec4(darkenColorNoAO, lightCalc.a);
        a *= aoFact;

        fragData.emissivity = max(fragData.emissivity, sunHazeEmissivity);
    } else {
        a *= lightCalc * rgbWithAlpha(diffuse, 1) * aoFact;
    }
}