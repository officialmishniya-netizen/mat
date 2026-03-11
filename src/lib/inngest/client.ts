import { EventSchemas, Inngest } from "inngest";

type Events = {
    "matrix/cycle.check": {
        data: {
            userId: string;
            spotId: string;
            levelId: number;
        };
    };
    "matrix/placement.run": {
        data: {
            userId: string;
            levelId: number;
        };
    };
};

export const inngest = new Inngest({
    id: "ptc-matrix-engine",
    schemas: new EventSchemas().fromRecord<Events>(),
});
