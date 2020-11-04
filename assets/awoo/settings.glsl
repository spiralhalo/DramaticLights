// SETTINGS (Requires resource reload)

// FOG SETTINGS

    // Extra ambient fog, separate from vanilla fog (default: true)
    // #define AMBIENT_FOG_ENABLED         true

    // Distance where fog starts (default: 128 [= 8 chunks])
    #define FOG_NEAR                    128

    // Distance where fog is at maximum density (default: 512 [= 32 chunks])
    // Setting FOG_FAR to be greater than render distance weakens the maximum fog density.
    #define FOG_FAR                     512

// BLOOM SETTINGS


    // Emissivity strength of block-lit objects. Also affected by Canvas bloom settings (default: 1.0)
    #define BLOCK_LIGHT_HAZE            1.0

// TWILIGHT INTENSITY SETTINGS

    // Strength of the red tint during dawn/dusk (default: 1.0)
    #define TWILIGHT_AMBIENT_INTENSITY  1.0

    // Extra redness added to the east/west side of objects during dawn/dusk (default: 0.5)
    #define TWILIGHT_LUMINATION         0.5

// COLOR SETTINGS

    // Color of sunlight (default: vec3(1.0, 1.0, 1.0) [= white])
    #define SUN_COLOR                   vec3(1.0, 1.0, 1.0)

    // Color of dawn/dusk ambience (default: vec3(1.0, 0.5, 0.18) [= reddish orange])
    #define TWILIGHT_COLOR              vec3(1.0, 0.5, 0.18)

    // Color of day ambience (default: vec3(0.28, 0.89, 1.0) [= cyan])
    #define DAY_AMBIENCE_COLOR          vec3(0.28, 0.89, 1.0)

    // Color of day fog (default: vec3(0.5, 0.77, 1.0) [= desaturated cyan])
    #define DAY_FOG_COLOR               vec3(0.5, 0.77, 1.0)

    // Color of day fog (default: vec3(0.10, 0.10, 0.20) [= dark blue])
    #define NIGHT_AMBIENCE_COLOR        vec3(0.10, 0.10, 0.20)


// EXPERT MODE

    // How much lack of sunlight may cause objects to appear darker (default: 0.2)
    #define ANGULAR_DELUMINATION        0.2

    // How much may sunlight brighten a face (default: 0.1)
    #define SUN_EXPOSURE_POWER          0.1

    // How much a face need to align with sun position to receive haze effect (default: 0.9)
    #define SUN_HAZE_CUTOFF             0.9

    // Amount of emissivity applied during noon (default: 0.05)
    #define NOON_HAZE_EMISSIVITY        0.05

    // Amount of extra emissivity applied during dawn/dusk (default: 0.8)
    #define TWILIGHT_HAZE_EMISSIVITY    0.8

    // Strengh of sunrise ambience. Sunset ambience is always at maximum strength (default: 0.6)
    #define MORNING_TWILIGHT            0.6

    // Maximum light and diffuse value to receive aesthetic ambient color (default: 0.8)
    #define AMBIENT_DARKNESS_CUTOFF     0.8
    
    // Similar to above but used for night ambience (default: 0.5)
    #define DEEP_DARKNESS_CUTOFF        0.5