(function () {

	var DEVTEAM = [];
	var OPTIONS_TIMESPENT = {
		SCREEN_WIDTH: '100%'
	};

	let network = new window.Network();
	var utils = new window.Utils();
	var params = utils.getQueryString();
	var time_to_look = Number(params.timespent2) || Number(params.timespent) || 8;

	// Загружает список watcher в этих задачах
	// EPIC: https://onetwotripdev.atlassian.net/browse/PM-610
	let issues;
	if (document.location.href.indexOf('mobile') > -1) {
		issues = ['IOS-3591','ADR-3146'];
	} else if (document.location.href.indexOf('devops') > -1) {
		issues = ['SRV-3668'];
	} else if (document.location.href.indexOf('bus') > -1) {
		issues = ['BUS-524'];
	} else if (document.location.href.indexOf('b2b') > -1) {
		issues = ['B2B-1285'];
	} else if (document.location.href.indexOf('railways') > -1) {
		issues = ['RR-3137'];
	} else if (document.location.href.indexOf('infra') > -1) {
		issues = ['OTT-15821'];
	} else if (document.location.href.indexOf('design') > -1) {
		issues = ['DSN-1945'];
	} else if (document.location.href.indexOf('vas') > -1) {
		issues = ['OTT-15822'];
	} else if (document.location.href.indexOf('car') > -1) {
		issues = ['CAR-720'];
	} else if (document.location.href.indexOf('avia') > -1) {
		issues = ['OTT-15814'];
	} else if (document.location.href.indexOf('hotels') > -1) {
		issues = ['OTT-15819'];
	} else if (document.location.href.indexOf('marketing') > -1) {
		issues = ['MAR-111'];
	} else if (document.location.href.indexOf('seo') > -1) {
		issues = ['SEO-51'];
	} else if (document.location.href.indexOf('activities') > -1) {
		issues = ['ACT-12'];
	} else if (document.location.href.indexOf('email') > -1) {
		issues = ['EML-4'];
	} else {
		issues = ['OTT-15814','RR-3137','B2B-1285','OTT-15819','SEO-51','MAR-111','OTT-15821', 'CAR-720',
			'OTT-15822','BUS-524','ACT-12','IOS-3591','ADR-3146','SRV-3668','DSN-1945','EML-4'];
	}

	const template = `/monitor/jira/api/latest/user/search/query?query=is%20watcher%20of%20($ISSUE)`;
	const urls = issues.map(function(issue) {
		return template.replace('$ISSUE', issue);
	});

	network.loadParallel(urls, function(err, result) {
		result = result.map(function(team) {
			const teammates = team.values.map(function(r) {
				// return r.accountId; - плохо работает, если нету ворклога, будет uuid на дашборде
				return r.displayName;
			})

			teammates.sort(function(a, b) {
				if (a == b) return 0;
				return a > b ? 1 : -1;
			});

			return teammates;
		});


		DEVTEAM = result.reduce(function(a,b,c) {
			return a.concat(b, '');
		}, [])

		if (params.user) {
			DEVTEAM = [params.user];
		}

		let timespent = new window.TaskTimespend(DEVTEAM, time_to_look, document.getElementById('timespend-left'), OPTIONS_TIMESPENT);
		let timeoffs = new window.Timeoffs(DEVTEAM, time_to_look,  document.getElementById('timespend-split-screen'), {});

		timespent.process();
		timeoffs.process();
	});

})();

