declare module "@/data/profile-backup.json" {
    const value: {
        name: string;
        name_vi: string;
        name_en: string;
        role: string;
        email: string;
        phone: string;
        github: string;
        education: {
            timeline: string;
            school_vi: string;
            school_en: string;
            major_vi: string;
            major_en: string;
            gpa: string;
        };
        certificates: Array<{
            name: string;
            url: string;
        }>;
        skills: {
            languages: string[];
            backend: string[];
            frontend: string[];
            database: string[];
            tools: string[];
            others: string[];
        };
    };
    export default value;
}
