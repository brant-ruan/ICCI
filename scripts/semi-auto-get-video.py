#!/usr/bin/env python

import json
import sys
from youtube_search import YoutubeSearch


def get_video_url(title, max_results=6):
    results = YoutubeSearch(title, max_results=max_results).to_dict()
    return results


# Get the video url on youtube for talks on conferences
# Usage: python semi-auto-get-video.py <year> <conference> <location>
# Example: python semi-auto-get-video.py 2022 blackhat usa
# read the content.json from ../confereces/<year>/<conference>/<location>/content.json

def get_video_urls(year, conference, location):
    res = dict()
    res['topics'] = list()
    try:
        with open(f'../conferences/{year}/{conference}/{location}/content.json') as f:
            data = json.load(f)
    except FileNotFoundError:
        print('File not found')
        return
    for i, topic in enumerate(data['topics']):
        res['topics'].append(topic)
        if 'video' in topic:
            continue
        results = get_video_url(topic['name'])
        if len(results) == 0:
            print(f'No video found for {topic["name"]}')
            continue
        print(f"[{i}/{len(data['topics'])}] Talk: " + topic['name'])
        for i, result in enumerate(results):
            print('----------------------------------------')
            print(f'[{i}] Title: {result["title"]}')
            print(f'[{i}] Published Time: {result["publish_time"]}')
            print(f'[{i}] Channel: {result["channel"]}')
        print('----------------------------------------')

        # select the video
        try:
            index = input('Choice: ')
            if index == 'n' or index == 'N':
                print()
                continue
            # if only enter, select the first one
            if index == '':
                index = 0
            else:
                index = int(index)
            if index < 0 or index >= len(results):
                print('Invalid input')
                continue
        except ValueError:
            continue
        
        # save the video url
        res['topics'][-1]['video'] = f"https://www.youtube.com/watch?v={results[index]['id']}"
        print()

    # save the result
    with open(f'../conferences/{year}/{conference}/{location}/content.json', 'w') as f:
        json.dump(res, f, indent=4)


if __name__ == '__main__':
    # check arguments
    if len(sys.argv) != 4:
        print('Usage: python semi-auto-get-video.py <year> <conference> <location>')
        print('Example: python semi-auto-get-video.py 2022 blackhat usa')
        sys.exit(1)
    get_video_urls(sys.argv[1], sys.argv[2], sys.argv[3])
