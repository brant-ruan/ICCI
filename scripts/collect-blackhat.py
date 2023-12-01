#!/usr/bin/env python

import os
import json
import sys
import requests

base_url = 'https://www.blackhat.com/{loc}-{year}/briefings/schedule/sessions.json'

loc_mappings = {
    'usa': 'us',
    'europe': 'eu',
    'asia': 'asia',
}


def get_talks_for_year(year):
    # visit year dir in ../conferences and find all blackhat subdirs
    # for each subdir, visit the loc dir and find all content.json
    # if the content.json is empty, then fullfill it with the data from the url
    # else, do nothing
    # skip files (not dirs)
    if not os.path.isdir(f'../conferences/{year}'):
        return

    for loc in os.listdir(f'../conferences/{year}/blackhat'):
        res = {
            'topics': [],
        }
        # check if content.json is empty
        # if not, skip
        # else, fetch data from url and save to content.json
        if os.path.isfile(f'../conferences/{year}/blackhat/{loc}/content.json'):
            try:
                with open(f'../conferences/{year}/blackhat/{loc}/content.json') as f:
                    content = json.load(f)
                    if content:
                        continue
            except json.decoder.JSONDecodeError:
                pass
        # 2023 -> "2023" -> "23"
        url = base_url.format(loc=loc_mappings[loc], year=str(year)[-2:])
        r = requests.get(url)
        if r.status_code != 200:
            print(f'error fetching {url}')
            continue
        content = r.json()
        sessions = content['sessions']
        for _, talk in sessions.items():
            if 'source_session_id' in talk:
                if talk['source_session_id'] != talk['id']:
                    continue
            if talk['format'] != 'Briefings':
                continue
            if 'NOC Report' in talk['title']:
                continue
            if '(NOC) Report' in talk['title']:
                continue
            if 'Black Hat' in talk['title'] and 'Network Operations Center' in talk['title']:
                continue
            if "Fireside Chat" in talk['title']:
                continue
            if 'Locknote:' in talk['title']:
                continue
            print(f'[*][{loc}] {talk["title"]}')
            entry = {
                'name': talk['title'],
            }
            res['topics'].append(entry)

        # save to content.json
        with open(f'../conferences/{year}/blackhat/{loc}/content.json', 'w') as f:
            json.dump(res, f, indent=4)


if __name__ == '__main__':
    get_talks_for_year(sys.argv[1])
