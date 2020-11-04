// SETTINGS (Requires resource reload)

// BLOOM SETTINGS

    // Emissivity strength of block-lit objects. Also affected by Canvas bloom settings (default: 1.0)
    #define BLOCK_LIGHT_HAZE            1.0

// COLOR SETTINGS

    // Color of sunlight (default: vec3(1.0, 1.0, 1.0) [= white])
    #define SUN_COLOR                   vec3(1.0, 1.0, 1.0)

    // Color of dawn and dusk ambience (default: vec3(1.0, 0.5, 0.18) [= reddish orange])
    #define TWILIGHT_COLOR              vec3(1.0, 0.5, 0.18)

    // Color of day ambience (default: vec3(0.28, 0.89, 1.0) [= cyan])
    #define DAY_AMBIENCE_COLOR          vec3(0.28, 0.89, 1.0)

    // Color of night ambience (default: vec3(0.10, 0.10, 0.20) [= dark blue])
    #define NIGHT_AMBIENCE_COLOR        vec3(0.10, 0.10, 0.20)

// INTENSITY SETTINGS

    // Intensity of day ambience (default: 0.8)
    #define DAY_AMBIENCE_INTENSITY      0.8

// EXPERT MODE

    // How much may sunlight brighten a face (default: 0.1)
    #define SUN_EXPOSURE_POWER          0.1

    // How much a face need to align with sun position to receive haze effect (default: 0.9)
    #define SUN_HAZE_CUTOFF             0.9

    // Amount of emissivity applied during noon (default: 0.05)
    #define NOON_HAZE_EMISSIVITY        0.05

    // Amount of extra emissivity applied during dawn and dusk (default: 0.8)
    #define TWILIGHT_HAZE_EMISSIVITY    0.8

    // Strengh of sunrise ambience. Sunset ambience is always at maximum strength (default: 0.6)
    #define MORNING_TWILIGHT            0.6

    // Maximum light and diffuse value to receive aesthetic ambient color (default: 0.8)
    #define AMBIENT_DARKNESS_CUTOFF     0.8
    
    // Similar to above but used for night ambience (default: 0.5)
    #define DEEP_DARKNESS_CUTOFF        0.5