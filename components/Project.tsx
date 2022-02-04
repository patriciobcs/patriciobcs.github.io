import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { ga, languageColor, skeleton } from "../helpers/utils";
import { AiOutlineStar, AiOutlineFork } from 'react-icons/ai';
import * as config from 'lib/config';
import { LoadingContext } from 'contexts';
import axios from "axios";
import moment from 'moment';

export const Project: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [repo, setRepo] = useState(null);
    const [error, setError] = useState(null);
    const [rateLimit, setRateLimit] = useState(null);

    const loadData = useCallback(() => {
        axios.get(`https://api.github.com/users/${config.github.username}`)
        .then(response => {
            let data: any = response.data;

            let profileData = {
                avatar: data.avatar_url,
                name: data.name ? data.name : '',
                bio: data.bio ? data.bio : '',
                location: data.location ? data.location : '',
                company: data.company ? data.company : ''
            }

            setProfile(profileData);
        })
        .then(() => {
            let excludeRepo = ``;

            config.github.exclude.projects.forEach(project => {
                excludeRepo += `+-repo:${config.github.username}/${project}`;
            });

            let query = `user:${config.github.username}+fork:${!config.github.exclude.forks}${excludeRepo}`;

            let url = `https://api.github.com/search/repositories?q=${query}&sort=${config.github.sortBy}&per_page=${config.github.limit}&type=Repositories`;

            axios.get(url, {
                headers: {
                    'Content-Type': 'application/vnd.github.v3+json'
                }
            })
            .then(response => {
                let data: any = response.data;

                setRepo(data.items);
            })
            .catch((error) => {
                handleError(error);
            });
        })
        .catch((error) => {
            handleError(error);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [setLoading])

    useEffect(() => {
        loadData();
    }, [loadData])

    const handleError = (error) => {
        console.error('Error:', error);
        try {
            setRateLimit({
                remaining: error.response.headers['x-ratelimit-remaining'],
                reset: moment(new Date(error.response.headers['x-ratelimit-reset'] * 1000)).fromNow(),
            });

            if (error.response.status === 403) {
                setError(429);
            } else if (error.response.status === 404) {
                setError(404);
            } else {
                setError(500);
            }
        } catch (error2) {
            setError(500);
        }
    }

    const renderSkeleton = () => {
        let array = [];
        for (let index = 0; index < config.github.limit; index++) {
            array.push((
                <div className="card shadow-lg compact bg-base-100" key={index}>
                    <div className="flex justify-between flex-col p-8 h-full w-full">
                        <div>
                            <div className="flex items-center">
                                <span>
                                    <h5 className="card-title text-lg">
                                        {skeleton({ width: 'w-32', height: 'h-8' })}
                                    </h5>
                                </span>
                            </div>
                            <div className="mb-5 mt-1">
                                {skeleton({ width: 'w-full', height: 'h-4', className: 'mb-2' })}
                                {skeleton({ width: 'w-full', height: 'h-4' })}
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="flex flex-grow">
                                <span className="mr-3 flex items-center">
                                    {skeleton({ width: 'w-12', height: 'h-4' })}
                                </span>
                                <span className="flex items-center">
                                    {skeleton({ width: 'w-12', height: 'h-4' })}
                                </span>
                            </div>
                            <div>
                                <span className="flex items-center">
                                    {skeleton({ width: 'w-12', height: 'h-4' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        }

        return array;
    }

    const renderProjects = () => {
        return repo.map((item, index) => (
            <div
                className="card shadow-lg compact bg-base-100 cursor-pointer blur-card"
                key={index}
                onClick={() => {
                    try {
                        if (config.googleAnalytics?.id) {
                            ga.event({
                                action: "Click project",
                                params: {
                                    project: item.name
                                }
                            });
                        }
                    } catch (error) {
                        console.error(error);
                    }

                    window.open(item.html_url, '_blank')
                }}
            >
                <div className="flex justify-between flex-col p-8 h-full w-full">
                    <div>
                        <div className="flex items-center opacity-80">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 mr-2 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                            <span>
                                <h5 className="card-title text-lg">
                                    {item.name}
                                </h5>
                            </span>
                        </div>
                        <p className="mb-5 mt-1 text-base-content text-opacity-80 text-sm">
                            {item.description}
                        </p>
                    </div>
                    <div className="flex justify-between text-sm text-base-content text-opacity-80">
                        <div className="flex flex-grow">
                            <span className="mr-3 flex items-center">
                                <AiOutlineStar className="mr-0.5" />
                                <span>{item.stargazers_count}</span>
                            </span>
                            <span className="flex items-center">
                                <AiOutlineFork className="mr-0.5" />
                                <span>{item.forks_count}</span>
                            </span>
                        </div>
                        <div>
                            <span className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-1 opacity-80" style={{ backgroundColor: languageColor(item.language) }} />
                                <span>{item.language}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        ));
    }

    return (
        <Fragment>
            <div className="col-span-1 lg:col-span-2 pb-10">
                <div className="notion-gallery-grid">
                    <div className="col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(loading || !repo) ? renderSkeleton() : renderProjects()}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}