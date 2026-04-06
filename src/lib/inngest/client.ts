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
    "simulation/run.full": {
        data: {
            breadth?: number;
            depth?: number;
            levelId?: number;
            watchesPerUser?: number;
            fundAmount?: number;
            runMatrix?: boolean;
            runPTC?: boolean;
            runCrossRewards?: boolean;
        };
    };
    "simulation/wipe": {
        data: {};
    };
};

export const inngest = new Inngest({
    id: "ptc-matrix-engine",
    schemas: new EventSchemas().fromRecord<Events>(),
});
