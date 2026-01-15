import { type RouteConfig, 
    index, 
    route, 
    prefix, 
    layout} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), 
    route("admin", "routes/admin.tsx"),
    ...prefix("draw_to_impress", [ 
        layout( "routes/draw_to_impress/app.tsx", [
        index("routes/draw_to_impress/draw_to_impress.tsx"),
        route("lobby", "routes/draw_to_impress/lobby.tsx"),
        route("vote", "routes/draw_to_impress/vote.tsx"),
        route("result", "routes/draw_to_impress/result.tsx")
    ])
    ]),
] satisfies RouteConfig;
