
import { App} from '../app/app';
import SearchByActivity from '../landingpage/components/SearchByActivity';
export const routes: any = {
    path: "/a",
    component: SearchByActivity,
    childRoutes: [{
        path: "/a/b",
        component: App
    },
    {
        path: "/a/c",
        component: SearchByActivity
    }    ]
};