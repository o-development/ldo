import type { TestData } from "./testData.js";

/**
 * EACH OF AND SIMPLE
 */
export const eachOfAndSimple: TestData = {
  name: "eachOfAndSimple",
  shexc: `
  PREFIX ex: <https://example.com/>

  ex:MediaContainerShape {
    a [ ex:MediaContainer ];
    ex:videoImage @ex:VideoShape * ;
    ex:videoImage @ex:ImageShape * ;
  }

  ex:VideoShape {
    a [ ex:Video ];
  }

  ex:ImageShape {
    a [ ex:Image ];
  }
  `,
  sampleTurtle: "",
  baseNode: "",
  successfulContext: {
    type: {
      "@id": "@type",
    },
    MediaContainer: {
      "@id": "https://example.com/MediaContainer",
      "@context": {
        type: {
          "@id": "@type",
        },
        videoImage: {
          "@id": "https://example.com/videoImage",
          "@type": "@id",
          "@isCollection": true,
        },
      },
    },
    videoImage: {
      "@id": "https://example.com/videoImage",
      "@type": "@id",
      "@isCollection": true,
    },
    Video: "https://example.com/Video",
    Image: "https://example.com/Image",
  },
  successfulTypings:
    'import { LdSet, LdoJsonldContext } from "@ldo/ldo"\n\nexport interface MediaContainerShape {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    type: {\n        "@id": "MediaContainer";\n    };\n    videoImage?: LdSet<VideoShape | ImageShape>;\n}\n\nexport interface VideoShape {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    type: {\n        "@id": "Video";\n    };\n}\n\nexport interface ImageShape {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    type: {\n        "@id": "Image";\n    };\n}\n\n',
};
