import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'blog',
        loadChildren: './blog/blog.module#BlogModule',
        pathMatch: 'full'
    },
    {
        path: 'test',
        loadChildren: './test/test.module#TestModule',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
