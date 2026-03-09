import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    scenarios: {
        load_test: {
            executor: 'ramping-vus',
            stages: [
                { duration: '10s', target: 50 },
                { duration: '50s', target: 100 },
                { duration: '10s', target: 0 },
            ],
            gracefulRampDown: '5s'
        },
    },
    thresholds: {
        'http_req_duration': ['p(95)<200'],
        'http_req_failed': ['rate<0.1'],
    }
};

export default function () {
    const response = http.get('http://localhost:3000/api/hello', {
        headers: {
            // 'Authorization': '1efc03f3-abde-4888-aee6-e1764c13529e', //opaque
            // 'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJha2EiLCJpYXQiOjE3NzMwNzIyODIsImV4cCI6MTc3MzE1ODY4Mn0.M_xdF40JI15eltSbgNPTash0ojE5ByUnXl9K2Ww2xzs', //jwt
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJha2EiLCJpYXQiOjE3NzMwNzM2NDAsImV4cCI6MTc3MzE2MDA0MH0.8NwcqbfdFJBTIAQVBQTVWzUJ4PqptQVfzRE1DirjaGM', //redis cache + jwt
        }
    });

    check(response, {
        'status is 200': (r) => r.status === 200,
        'response time is < 200ms': (r) => r.timings.duration < 200,
        'response has body': (r) => r.body && r.body.length > 0,
    });

    if(response.status !== 200) {
        console.error(`Request failed with status ${response.status}: ${response.body}`);
    }
}

export function setup() {
    console.log('Starting performance test...');
    console.log('Target: http://localhost:3000/api/hello');
    console.log('Scenario: 10s ramp-up to 50VUs, 50s at 100VUs, 10s ramp-down');
}

export function teardown() {
    console.log('Performance test completed');
}