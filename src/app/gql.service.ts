import { Injectable } from "@angular/core";
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject, debounceTime, Subject, Subscription } from "rxjs";
import { FilterOptions, FilterEntry, LaunchesPast, LaunchesPastEntry, QueryParamsT } from 'src/app/types';
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
            result {
                totalCount
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
    private filterShipsSubject = new BehaviorSubject<string[]>([]);
    filterShips = this.filterShipsSubject.asObservable();

    private filterRocketsSubject = new BehaviorSubject<string[]>([]);
    filterRockets = this.filterRocketsSubject.asObservable();

    launchesPastSubject = new BehaviorSubject<LaunchesPast>({ loading: true });
    launchesPast = this.launchesPastSubject.asObservable();

    subscription: Subscription;
    queryParams: QueryParamsT = {
        missionName: "",
        rocketName: "",
        offset: 0
    }

    totalCount: number = 0

    queryParamsSubscription = new Subject();

    constructor(
        private apollo: Apollo,
        private storeService: StoreService
    ) {
        this.storeService.queryParams.pipe(debounceTime(500)).subscribe({
            next: (data) => {
                this.queryParams = data
                this.getGqlData()
            }
        })
    }

    // setRocketName(name: string) {
    //     this.rocketName = name
    //     // console.log(this.rocketName)
    // }

    // setMissionName(name: string) {
    //     this.missionName = name
    //     // console.log(this.missionName)
    // }

    getCurOffset() {
        // return this.offset
    }

    rmCurOffset() {
        // this.offset = 0
    }

    incCurOffset() {
        // this.offset = ((this.offset + 5) > this.totalCount) ? this.offset : this.offset + 5
        // this.getGqlData()
    }

    decCurOffset() {
        // this.offset = ((this.offset - 5) < 0) ? this.offset : this.offset - 5
        // this.getGqlData()
    }

    getGqlData() {
        console.log('getGqlData')
        this.subscription = this.apollo
            .watchQuery({
                query: GET_DATA,
                variables: {
                    rocketName: this.queryParams.rocketName,
                    missionName: this.queryParams.missionName,
                    offset: this.queryParams.offset
                },
            })
            .valueChanges.subscribe((result: any) => {
                this.launchesPastSubject.next({
                    loading: result.loading,
                    entries: result?.data?.launchesPastResult?.data?.map((entry: LaunchesPastEntry) => entry)
                })
                this.filterShipsSubject.next(result?.data?.launchesPastResult?.data?.ships?.map((entry: FilterEntry) => entry.name));
                this.filterRocketsSubject.next(result?.data?.launchesPastResult?.data?.rockets?.map((entry: FilterEntry) => entry.name));
                this.totalCount = result?.data?.launchesPastResult?.result?.totalCount
                // this.error = result.error;
                this.subscription.unsubscribe();
            });
    }
}
