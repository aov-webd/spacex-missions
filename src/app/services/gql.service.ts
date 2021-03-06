import { Injectable } from "@angular/core";
import { Apollo, gql } from 'apollo-angular';
import { debounceTime, Subject, Subscription } from "rxjs";
import { FilterEntry, LaunchesPastEntry, QueryParamsT } from 'src/app/types';
import { StoreService } from "./store.service";

const GET_DATA = gql`
    query launchesPast($rocketName: String, $missionName: String, $offset: Int) {
        launchesPastResult(limit: 5, offset:  $offset, find: {rocket_name: $rocketName, mission_name: $missionName}) {
            data {
                mission_name
                launch_year
                rocket {
                    rocket_name
                }
                id
                details
                ships {
                    name
                }
            }
        }
        ships {
            name
        }
        rockets {
            name
        }
    }
`;

@Injectable({
    providedIn: 'root'
})
export class GqlService {
    subscription: Subscription;

    queryParams: QueryParamsT = {
        missionName: "",
        rocketName: "",
        offset: 0
    };

    totalCount: number = 0;

    queryParamsSubscription = new Subject();

    constructor(
        private apollo: Apollo,
        private storeService: StoreService
    ) {
        this.storeService.queryParams.pipe(debounceTime(500)).subscribe({
            next: (data) => {
                this.queryParams = data;
                this.getGqlData();
            }
        });
    }
    getGqlData() {
        this.storeService.setLaunchesPast({
            loading: true,
            entries: []
        });
        this.subscription = this.apollo
            .watchQuery({
                query: GET_DATA,
                variables: {
                    rocketName: this.queryParams.rocketName,
                    missionName: this.queryParams.missionName,
                    offset: this.queryParams.offset
                },
            })
            .valueChanges
            .subscribe((result: any) => {
                console.log(result.loading);
                this.storeService.setLaunchesPast({
                    loading: result.loading,
                    entries: result?.data?.launchesPastResult?.data?.map((entry: LaunchesPastEntry) => entry)
                });

                this.storeService.setAllRocketNames(result?.data?.rockets?.map((entry: FilterEntry) => entry.name));
                this.storeService.setTotalCount(result?.data?.launchesPastResult?.result?.totalCount);
            });
    }
}
