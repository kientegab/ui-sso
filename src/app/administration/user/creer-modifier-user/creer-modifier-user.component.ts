import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {  FormGroup, NgForm } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { ConfirmationService, Message } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IProfil } from 'src/app/shared/model/profil';
import { IProfilImage, ProfilImage } from 'src/app/shared/model/profil-image';
import { IUser, User } from 'src/app/shared/model/user';
import { ProfilService } from 'src/app/shared/service/profil.service';
import { UserService } from 'src/app/shared/service/user.service';

@Component({
  selector: 'app-creer-modifier-user',
  templateUrl: './creer-modifier-user.component.html',
  styleUrls: ['./creer-modifier-user.component.scss']
})
export class CreerModifierUserComponent implements OnInit {

  @ViewChild('dtf') form!: NgForm; 

  user: IUser = new User();
  @Input() data:IUser = new User();
  error: String | undefined;
  showDialog = false;
  isDialogOpInProgress!: boolean;
  message: any;
  dialogErrorMessage: any;
  //confirmePassword: string | undefined;
  profils: IProfil[] = [];
  imageURL: string | undefined; 
  uploadForm!: FormGroup;
  currentFileUpload: IProfilImage = new ProfilImage();
  changeImage: boolean = false;
  uploading: boolean = false;
  imageToShow: string | undefined;
  isOpInProgress!: boolean;
  timeoutHandle: any;

  constructor(
    private userService: UserService,
    private dialogRef: DynamicDialogRef,
    private dynamicDialog:  DynamicDialogConfig,
    private profilService : ProfilService,
    private confirmationService : ConfirmationService,
) {}


  ngOnInit(): void {
    this.loadPrfofil();
    if (this.dynamicDialog.data) {
      this.user = cloneDeep(this.dynamicDialog.data);
    }
  }


    /** Permet d'afficher le tableau avec tout les elements */
    loadPrfofil(): void {
      this.profilService.findListe().subscribe(
        {
          next: (result) => {
            if (result && result.body) {
              this.profils = result.body!;
            }
          },
          error: (reason) => {
            this.message = { severity: 'error', summary: reason.error };
            console.error(JSON.stringify(reason));
          }
        });
    }
  clear(): void {
    this.form.resetForm();
    this.dialogRef.close();
    this.dialogRef.destroy();
  }

  isEditing() {
    return !!this.user.id;
  }

  clearDialogMessages() {
    this.dialogErrorMessage = null;
  }
  // Errors
  handleError(error: HttpErrorResponse) {
    console.error(`Processing Error: ${JSON.stringify(error)}`);
    this.isDialogOpInProgress = false;
    this.dialogErrorMessage = error.error.title;
  }

  showMessage(message: Message) {
    this.message = message;
    this.timeoutHandle = setTimeout(() => {
      this.message = null;
    }, 5000);
  }

  saveEntity(): void { 
    this.isDialogOpInProgress = true;
    if (this.user) {
      if (this.user.id) {
        this.userService.create(this.user).subscribe(
          {
            next: (response) => {
              this.dialogRef.close(response);
              this.dialogRef.destroy();
              this.showMessage({ severity: 'success', summary: 'Utilisateur modifié avec succès' });
             
            },
            error: (error) => {
              console.error("error" + JSON.stringify(error));
              this.isOpInProgress = false;
              this.showMessage({ severity: 'error', summary: error.message });

            }
          });
      } else {
        this.userService.create(this.user).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
            this.dialogRef.destroy();
            this.showMessage({
              severity: 'success',
              summary: 'Utilisateur creer avec succès',
            });
          },
          error: (error) => {
            console.error("error" + JSON.stringify(error));
            this.isOpInProgress = false;
            this.showMessage({ severity: 'error', summary: error.error.message });

          }
        });
      }
    }
  }


  onFileChange(event:any) {
    const reader = new FileReader();
    if(event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageToShow = reader.result as string;
      };
    }
  
  }
}
