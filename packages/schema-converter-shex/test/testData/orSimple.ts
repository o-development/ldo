import type { TestData } from "./testData";

/**
 * OR SIMPLE
 */
export const orSimple: TestData = {
  name: "orSimple",
  shexc: `
  PREFIX ex: <https://example.com/>

  ex:MediaContainerShape {
    a [ ex:MediaContainer ];
    ex:primaryMedia (@ex:VideoShape OR @ex:ImageShape) ;
    ex:media (@ex:VideoShape OR @ex:ImageShape) * ;
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
        primaryMedia: {
          "@id": "https://example.com/primaryMedia",
          "@type": "@id",
        },
        media: {
          "@id": "https://example.com/media",
          "@type": "@id",
          "@isCollection": true,
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
    'import {ContextDefinition} from "jsonld"\n\nexport interface MediaContainerShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type: {\n        "@id": "MediaContainer";\n    };\n    primaryMedia: VideoShape | ImageShape;\n    media?: (VideoShape | ImageShape)[];\n}\n\nexport interface VideoShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type: {\n        "@id": "Video";\n    };\n}\n\nexport interface ImageShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type: {\n        "@id": "Image";\n    };\n}\n\n',
};
