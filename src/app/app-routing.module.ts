import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'blog',
        loadChildren: () => import('./blog/blog.module').then(m => m.BlogModule),
        pathMatch: 'full'
    },
    {
        path: 'test',
        loadChildren: () => import('./test/test.module').then(m => m.TestModule),
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
