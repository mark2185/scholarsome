import { NgModule } from "@angular/core";
import { CreateStudySetComponent } from "./study-set/create-study-set.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CommonModule } from "@angular/common";
import { CreateRoutingModule } from "./create-routing.module";
import { SharedModule } from "../shared/shared.module";
import { FormsModule } from "@angular/forms";

@NgModule({
  imports: [
    FontAwesomeModule,
    CreateRoutingModule,
    CommonModule,
    SharedModule,
    FormsModule
  ],
  exports: [],
  declarations: [CreateStudySetComponent]
})
export class CreateModule {}
