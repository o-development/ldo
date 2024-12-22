import type { TestData } from "./testData";

/**
 * AND SIMPLE
 */
export const andSimple: TestData = {
  name: "andSimple",
  shexc: `
  PREFIX ex: <https://example.com/>

  ex:MediaContainerShape {
    a [ ex:MediaContainer ];
    ex:videoImage (@ex:VideoShape AND @ex:ImageShape) ;
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
    MediaContainer: {
      "@id": "https://example.com/MediaContainer",
      "@context": {
        type: {
          "@id": "@type",
        },
        videoImage: {
          "@id": "https://example.com/videoImage",
          "@type": "@id",
        },
      },
    },
    type: {
      "@id": "@type",
    },
    Video: "https://example.com/Video",
    Image: "https://example.com/Image",
  },
  successfulTypings:
    'import {ContextDefinition} from "jsonld"\n\nexport interface MediaContainerShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type: {\n        "@id": "MediaContainer";\n    };\n    videoImage: VideoShape & ImageShape;\n}\n\nexport interface VideoShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type: {\n        "@id": "Video";\n    };\n}\n\nexport interface ImageShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type: {\n        "@id": "Image";\n    };\n}\n\n',
};
