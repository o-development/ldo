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
    type: {
      "@id": "@type",
    },
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
    primaryMedia: {
      "@id": "https://example.com/primaryMedia",
      "@type": "@id",
    },
    Video: "https://example.com/Video",
    Image: "https://example.com/Image",
    media: {
      "@id": "https://example.com/media",
      "@type": "@id",
      "@isCollection": true,
    },
  },
  successfulTypings:
    'import { LdSet, LdoJsonldContext } from "@ldo/ldo"\n\nexport interface MediaContainerShape {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    type: {\n        "@id": "MediaContainer";\n    };\n    primaryMedia: VideoShape | ImageShape;\n    media?: LdSet<VideoShape | ImageShape>;\n}\n\nexport interface VideoShape {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    type: {\n        "@id": "Video";\n    };\n}\n\nexport interface ImageShape {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    type: {\n        "@id": "Image";\n    };\n}\n\n',
};
