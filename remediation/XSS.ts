// Dans search-result.component.ts
// le problème venait this.searchValue qui utilisait BypassSecurityTrustHtml qu'on a enlevé avec le sanitizer

  filterTable () {
    let queryParam: string = this.route.snapshot.queryParams.q
    if (queryParam) {
      queryParam = queryParam.trim()
      this.ngZone.runOutsideAngular(() => { // vuln-code-snippet hide-start
        this.io.socket().emit('verifyLocalXssChallenge', queryParam)
      }) // vuln-code-snippet hide-end
      this.dataSource.filter = queryParam.toLowerCase()
      this.searchValue = queryParam
      if (this.gridDataSourceSubscription) {
        this.gridDataSourceSubscription.unsubscribe()
      }
      this.gridDataSourceSubscription = this.gridDataSource.subscribe((result: ProductTableEntry[]) => {
        if (result.length === 0) {
          this.emptyState = true
        } else {
          this.emptyState = false
        }
      })
    } else {
      this.dataSource.filter = ''
      this.searchValue = undefined
      this.emptyState = false
    }
  }



// Dans search-result.component.html on met searchValue en template au lieu de mettre innerHtml qui va considérer
// le contenu comme du html.

<main class="container">
  <div class="heading mat-elevation-z6 mat-headline-small">
    @if (searchValue) {
      <div>
        <span>{{ "TITLE_SEARCH_RESULTS" | translate }} - </span>
        <span id="searchValue">{{ searchValue }}</span>
      </div>
