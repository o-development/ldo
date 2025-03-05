export interface Resource {}

export class SolidResource implements Resource {}
export class SolidContainer extends SolidResource {}
export class SolidLeaf extends SolidResource {}

export class NextGraphResource implements Resource {}
