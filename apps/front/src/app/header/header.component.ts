import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ModalService } from "../shared/modal.service";
import { AuthService } from "../auth/auth.service";
import { CookieService } from "ngx-cookie";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { DeviceDetectorService } from "ngx-device-detector";
import { NavigationEnd, Router } from "@angular/router";
import { faQ, faArrowRightFromBracket, faStar } from "@fortawesome/free-solid-svg-icons";
import { SetsService } from "../shared/http/sets.service";
import { SharedService } from "../shared/shared.service";
import packageJson from "../../../../../package.json";
import { AnkiImportModalComponent } from "./anki-import-modal/anki-import-modal.component";
import { QuizletImportModalComponent } from "./quizlet-import-modal/quizlet-import-modal.component";
import { SetPasswordModalComponent } from "./set-password-modal/set-password-modal.component";
import { LoginModalComponent } from "./login-modal/login-modal.component";
import { ForgotPasswordModalComponent } from "./forgot-password-modal/forgot-password-modal.component";
import { RegisterModalComponent } from "./register-modal/register-modal.component";

@Component({
  selector: "scholarsome-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit, AfterViewInit {
  @ViewChild("ankiImport") ankiImportModal: AnkiImportModalComponent;
  @ViewChild("quizletImport") quizletImportModal: QuizletImportModalComponent;
  @ViewChild("setPassword") setPasswordModal: SetPasswordModalComponent;
  @ViewChild("login") loginModal: LoginModalComponent;
  @ViewChild("forgot") forgotPasswordModal: ForgotPasswordModalComponent;
  @ViewChild("register") registerModal: RegisterModalComponent;

  // Whether an update is available compared to the current running version
  protected updateAvailable: boolean;
  // URL of the new version
  protected releaseUrl: string;

  // Used to open the login modal after users verify their email
  protected verificationResult: boolean | null;

  /* */

  // Whether the header is hidden - hidden on the landing page
  protected hidden = false;

  // If the user is signed in
  protected signedIn = false;

  protected isMobile = false;

  protected modalRef?: BsModalRef;

  protected readonly packageJson = packageJson;
  protected readonly window = window;
  protected readonly faQ = faQ;
  protected readonly faGithub = faGithub;
  protected readonly faStar = faStar;
  protected readonly faArrowRightFromBracket = faArrowRightFromBracket;

  /**
   * @ignore
   */
  constructor(
    private readonly bsModalService: BsModalService,
    private readonly modalService: ModalService,
    private readonly authService: AuthService,
    private readonly deviceService: DeviceDetectorService,
    private readonly router: Router,
    private readonly setsService: SetsService,
    private readonly sharedService: SharedService,
    public readonly cookieService: CookieService
  ) {}

  async submitLogout() {
    await this.authService.logout();
    await this.router.navigate(["/"]);
  }

  ngOnInit(): void {
    this.sharedService.isUpdateAvailable().then((r) => this.updateAvailable = r);
    this.sharedService.getReleaseUrl().then((r) => this.releaseUrl = r);

    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.hidden = this.router.url === "/" || this.router.url === "/reset";
      }
    });

    this.modalService.modal.subscribe((e) => {
      switch (e) {
        case "register-open":
          this.modalRef = this.registerModal.open();
          break;
        case "login-open":
          this.modalRef = this.loginModal.open();
          break;
        case "set-password-open":
          this.modalRef = this.setPasswordModal.open();
          break;
        case "forgot-password-open":
          this.modalRef = this.forgotPasswordModal.open();
          break;
      }
    });

    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      if (!cookie.includes("verified")) continue;

      this.verificationResult = cookie.includes("true");
    }

    if (this.deviceService.isTablet() || this.deviceService.isMobile()) this.isMobile = true;

    if (this.cookieService.get("authenticated")) this.signedIn = true;

    // Hide modals when the route changes
    this.router.events.subscribe(() => this.modalRef?.hide());
  }

  ngAfterViewInit(): void {
    if (this.verificationResult) this.modalRef = this.loginModal.open();
  }
}
