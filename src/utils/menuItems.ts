import {
    Home,
    UserIcon,
    BookOpen,
    GraduationCap,
    Settings,
    Award,
    CreditCard,
    Paperclip,
    UserCog,
    Layers,
    FileCheck
} from "lucide-react";

export const ADMIN_MENU_ITEMS = [
    {
        id: "dashboard",
        icon: Home,
        label: "Dashboard",
        active: true,
        path: "/dashboard"
    },
    {
        id: "alumno",
        icon: UserIcon,
        label: "Alumno",
        active: false,
        path: "/personas/alumno"
    },
    {
        id: "colaborador",
        icon: UserIcon,
        label: "Colaborador",
        active: false,
        path: "/personas/colaborador"
    },
    {
        id: "apoderado",
        icon: UserIcon,
        label: "Apoderado",
        active: false,
        path: "/personas/apoderado"
    },
    {
        id: "curso",
        icon: BookOpen,
        label: "Curso",
        active: false,
        path: "/curso"
    },
    {
        id: "matricula",
        icon: GraduationCap,
        label: "Matrícula",
        active: false,
        path: "/matricula"
    },
    {
        id: "pago",
        icon: CreditCard,
        label: "Pago",
        active: false,
        path: "/pago"
    },
    {
        id: "adjunto",
        icon: Paperclip,
        label: "Adjunto",
        active: false,
        path: "/adjunto"
    },
    // {
    //     id: "certificado",
    //     icon: Award,
    //     label: "Certificado",
    //     active: false,
    //     path: "/certificado"
    // },
    // {
    //     id: "plantilla",
    //     icon: FileCheck,
    //     label: "Plantilla",
    //     active: false,
    //     path: "/plantilla"
    // },
    {
        id: "usuario",
        icon: UserCog,
        label: "Usuario",
        active: false,
        path: "/usuario"
    },
    {
        id: "mantenimiento",
        icon: Settings,
        label: "Mantenimiento",
        submenu: [
            {
                id: "periodo-academico",
                label: "Período académico",
                icon: Layers,
                path: "/mantenimiento/periodo-academico"
            },
            {
                id: "periodo-evaluación",
                label: "Período evaluación",
                icon: Layers,
                path: "/mantenimiento/periodo-evaluacion"
            },
            {
                id: "grado-academico",
                label: "Grado Académico",
                icon: Layers,
                path: "/mantenimiento/grado-academico"
            },
            {
                id: "parentesco",
                label: "Parentesco",
                icon: Layers,
                path: "/mantenimiento/parentesco"
            },

            // {
            //     id: "segmento",
            //     label: "Segmento",
            //     icon: Layers,
            //     path: "/mantenimiento/segmento"
            // },
            // {
            //     id: "sede",
            //     label: "Sede",
            //     icon: Layers,
            //     path: "/mantenimiento/sede"
            // },
            // {
            //     id: "institucion",
            //     label: "Institución",
            //     icon: Layers,
            //     path: "/mantenimiento/institucion"
            // }
        ]
    }
];

export const ALUMNO_MENU_ITEMS = [
    {
        id: "dashboard-alumno",
        icon: Home,
        label: "Dashboard",
        active: true,
        path: "/dashboard-alumno"
    },
    {
        id: "mis-matriculas",
        icon: GraduationCap,
        label: "Mis Matrículas",
        path: "/mis-matriculas"
    },
    {
        id: "mis-certificados",
        icon: Award,
        label: "Mis Certificados",
        path: "/mis-certificados"
    }
];