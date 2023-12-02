#!/usr/bin/env python

import json

with open('recon.json') as f:
    data = json.load(f)

days = data['schedule']['conference']['days']
res = list()

for day in days:
    for _, room in day['rooms'].items():
        for talk in room:
            if talk['type'] == 'Talk' or talk['type'] == 'Short Talk':
                res.append(talk['title'])

print(res)