import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Logger } from '@app/core';
import { ApiService } from '@app/services/api.service';
import { TranslateService } from '@ngx-translate/core';
import { PushNotificationsService } from 'ng-push';
import { Group, Device, DeviceAvailable, DevicesAvailable } from './group';
import { NotifyService } from '@app/services/notify.service';

const log = new Logger('CreateGroupComponent');

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  form: FormGroup;
  rows: Array<Group>;
  rowsTemp: any[] = [];
  editing = {};
  devices: Array<DevicesAvailable> = [];
  temp: any = [];
  hasEditing = false;

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private notifyService: NotifyService
  ) {}

  ngOnInit() {
    this.apiService.getZGroups().subscribe((groups: Array<Group>) => {
      groups.forEach(group => {
        const devicesSelected: any[] = [];
        group.Devices.forEach(device => {
          devicesSelected.push(device._NwkId);
        });
        group.devicesSelected = devicesSelected;
      });

      this.apiService.getZGroupDevicesAvalaible().subscribe((devices: Array<DevicesAvailable>) => {
        this.devices = devices;
        this.devices.forEach(device => {
          device.ZDeviceName = device.WidgetList[0].ZDeviceName;
        });
        this.devices = [...this.devices];
        this.rows = [...groups];
      });
    });
  }

  // ngOnInit() {
  //   this.form = this.formBuilder.group({
  //     devicesSelected: ['']
  //   });

  //   this.apiService.getZGroups().subscribe((result1: any) => {
  //     result1.forEach((value1: any) => {
  //       Object.entries(value1).forEach(entry => {
  //         const value2: any = entry[1];
  //         const key2: any = entry[0];
  //         value2.key = key2;
  //         const devicesSelected: any[] = [];
  //         Object.entries(value2.Devices).forEach(entry3 => {
  //           const value3: any = entry3[1];

  //           Object.keys(value3).forEach(values4 => {
  //             devicesSelected.push(values4);
  //           });
  //         });
  //         value2.devicesSelected = "devicesSelected";
  //         this.rowsTemp.push(value2);
  //       });
  //     });
  //     this.apiService.getZGroupDevicesAvalaible().subscribe((result: any) => {
  //       Object.entries(result).forEach(([key, value]) => {
  //         const item = new Group();
  //         item.ShortId = key;
  //         item.Ep = value[0][2];
  //         item.WidgetName = value[0][0];
  //         item.IEEE = value[0][1];
  //         this.devices.push(item);
  //         this.devices = [...this.devices];
  //       });
  //     });
  //     this.rows = [...this.rowsTemp];
  //   });
  // }

  updateValue(event: any, cell: any, rowIndex: any) {
    this.hasEditing = true;
    log.debug('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
    log.debug('UPDATED!', this.rows[rowIndex][cell]);
  }

  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.temp.filter(function(d: any) {
      let ok = false;
      if (d.Model) {
        ok = d.Model.toLowerCase().indexOf(val) !== -1;
      }
      if (!ok && d.ZDeviceName) {
        ok = d.ZDeviceName.toLowerCase().indexOf(val) !== -1;
      }
      if (!ok && d.key) {
        ok = d.key.toLowerCase().indexOf(val) !== -1;
      }
      if (!ok && d.Status) {
        ok = d.Status.toLowerCase().indexOf(val) !== -1;
      }
      if (!ok && d.IEEE) {
        ok = d.IEEE.toLowerCase().indexOf(val) !== -1;
      }
      if (!ok && d.WidgetNames) {
        const widgets = d.WidgetNames as Array<string>;
        widgets.forEach(function(value: string) {
          if (!ok && value) {
            ok = value.toLowerCase().indexOf(val) !== -1;
          }
        });
      }
      if (!ok && d.MacCapa) {
        const capas = d.MacCapa as Array<string>;
        capas.forEach(function(value: string) {
          if (!ok && value) {
            ok = value.toLowerCase().indexOf(val) !== -1;
          }
        });
      }
      return ok || !val;
    });
  }

  updateDevices() {
    this.hasEditing = false;
    this.apiService.putZGroups(this.rows).subscribe(result => {
      log.debug(this.rows);
      this.notifyService.notify();
    });
  }
}
