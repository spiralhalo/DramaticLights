// SETTINGS (Requires resource reload)

// BLOOM SETTINGS

    // Emissivity strength of block-lit objects. Also affected by Canvas bloom settings (default: 1.0)
    #define BLOCK_LIGHT_HAZE            1.0

// COLOR SETTINGS

    // Color of sunlight (default: vec3(1.0, 1.0, 1.0) [= white])
    #define SUN_COLOR                   vec3(1.0, 1.0, 1.0)

    // Color of dawn and dusk ambience (default: vec3(1.0, 0.6, 0.18) [= orange])
    #define TWILIGHT_COLOR              vec3(1.0, 0.6, 0.18)

    // Color of day ambience (default: vec3(0.28, 0.89, 1.0) [= cyan])
    #define DAY_AMBIENCE_COLOR          vec3(0.28, 0.89, 1.0)

    // Color of night ambience (default: vec3(0.10, 0.10, 0.20) [= dark blue])
    #define NIGHT_AMBIENCE_COLOR        vec3(0.10, 0.10, 0.20)

// INTENSITY SETTINGS

    // Intensity of day ambience (default: 0.8)
    #define DAY_AMBIENCE_INTENSITY      0.8