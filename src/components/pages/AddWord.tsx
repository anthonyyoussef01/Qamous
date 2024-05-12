import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './AddWord.scss';

const AddWord = () => {
    const [options, setOptions] = useState<string[]>([]);
    const [arabicWord, setArabicWord] = useState('');
    const [francoArabicWord, setFrancoArabicWord] = useState('');
    const [arabicDefinition, setArabicDefinition] = useState('');
    const [englishDefinition, setEnglishDefinition] = useState('');
    const [example, setExample] = useState('');
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [arabicWordError, setArabicWordError] = useState('');
    const [francoArabicWordError, setFrancoArabicWordError] = useState('');
    const [arabicDefinitionError, setArabicDefinitionError] = useState('');
    const [englishDefinitionError, setEnglishDefinitionError] = useState('');

    function onCountrySelect(ev: React.ChangeEvent<HTMLSelectElement>) {
        const selectedOptions = Array.from(ev.target.selectedOptions).map(option => option.value);
        setSelectedCountries(selectedOptions);
    }

    async function onAddWordClick() {
        // Clear previous errors
        setArabicWordError('');
        setFrancoArabicWordError('');
        setArabicDefinitionError('');
        setEnglishDefinitionError('');

        // Basic Arabic word validation
        if (!arabicWord || '' === arabicWord) {
            setArabicWordError('Arabic word is required');
            return;
        }
        // Validate Arabic word is in Arabic
        if (!/^[\u060C-\u061B\u061E-\u06D6ء-ي\s٠-٩]+$/u.test(arabicWord)) {
            setArabicWordError('The Arabic word must be in Arabic');
            return;
        }

        const wordDetails = {
            arabicWord,
            francoArabicWord,
            selectedCountries,
        };

        try {
            const wordResponse = await fetch('http://localhost:3000/word', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wordDetails),
                credentials: 'include',
            });

            if (!wordResponse.ok) {
                throw new Error(`Error creating word: ${wordResponse.status} ${wordResponse.statusText}`);
            }

            const word = await wordResponse.json();

            if (arabicDefinition) {
                const arabicDefinitionDetails = {
                    wordId: word.id,
                    userId: '1',
                    definition: arabicDefinition,
                    example,
                    isArabic: true,
                };

                const arabicDefinitionResponse = await fetch('http://localhost:3000/definitions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(arabicDefinitionDetails),
                    credentials: 'include',
                });

                if (!arabicDefinitionResponse.ok) {
                    throw new Error('Error creating Arabic definition');
                }
            }

            if (englishDefinition) {
                const englishDefinitionDetails = {
                    wordId: word.id,
                    userId: '1',
                    definition: englishDefinition,
                    example,
                    isArabic: false,
                };

                const englishDefinitionResponse = await fetch('http://localhost:3000/definitions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(englishDefinitionDetails),
                    credentials: 'include',
                });

                if (!englishDefinitionResponse.ok) {
                    throw new Error('Error creating English definition');
                }
            }

            // Clear the form
            setArabicWord('');
            setFrancoArabicWord('');
            setArabicDefinition('');
            setEnglishDefinition('');
            setExample('');
            setSelectedCountries([]);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        Papa.parse('countries.csv', {
            download: true,
            header: true,
            complete: function(results: { data: { ' CountryName': string }[] }) {
                //console.log("Papa Parse results:", results);
                const countries = results.data.map(row => row[' CountryName']);
                setOptions(countries);
            },
            error: function(err) {
                console.log('Papa Parse error:', err);
            },
        });
    }, []);

    return (
        <div className={'container'}>
            <div className={'container-title'}>
                <div>Add a new word</div>
            </div>
            <br />
            <div className={'container-input'}>
                <input
                    style={{ direction: 'rtl', textAlign: 'left' }}
                    type={'text'}
                    value={arabicWord}
                    placeholder="Enter the word in Arabic here"
                    onChange={(ev) => setArabicWord(ev.target.value)}
                    className={'container-input-box'}
                    required={true}
                />
                <label className="container-input-error">{arabicWordError}</label>
            </div>
            <div className={'container-input'}>
                <input
                    style={{ direction: 'ltr', textAlign: 'left' }}
                    type={'text'}
                    value={francoArabicWord}
                    placeholder="Enter the word in Franco-Arabic here"
                    onChange={(ev) => setFrancoArabicWord(ev.target.value)}
                    className={'container-input-box'}
                    required={false}
                />
                <label className="container-input-error">{francoArabicWordError}</label>
            </div>
            <div className={'container-input'}>
        <textarea
            style={{ direction: 'rtl', textAlign: 'left' }}
            rows={2}
            value={arabicDefinition}
            placeholder="Enter the definition in Arabic here"
            onChange={(ev) => setArabicDefinition(ev.target.value)}
            className={'container-input-box'}
            required={true}
        />
                <label className="container-input-error">{arabicDefinitionError}</label>
            </div>
            <div className={'container-input'}>
        <textarea
            style={{ direction: 'ltr', textAlign: 'left' }}
            rows={2}
            value={englishDefinition}
            placeholder="Enter the definition in English here"
            onChange={(ev) => setEnglishDefinition(ev.target.value)}
            className={'container-input-box'}
            required={false}
        />
                <label className="container-input-error">{englishDefinitionError}</label>
            </div>
            <div className={'container-input'}>
        <textarea
            style={{ direction: 'ltr', textAlign: 'left' }}
            rows={2}
            value={example}
            placeholder="Enter the example here"
            onChange={(ev) => setExample(ev.target.value)}
            className={'container-input-box'}
            required={false}
        />
                <label className="container-input-error"></label>
            </div>
            <div className={'container-input'}>
                <select
                    className={'container-input-box'}
                    multiple={true}
                    required={false}
                    onChange={onCountrySelect}
                >
                    <option value="">Select the country / countries of origin here (if applicable)</option>
                    {options.map((option, index) => (
                        <option key={index} value={option}
                                selected={selectedCountries.includes(option)}>{option}</option>
                    ))}
                </select>
                <label className="container-input-error"></label>
            </div>
            <br />
            <div className={'container-buttons'}>
                <button
                    className={'container-buttons-button'}
                    onClick={onAddWordClick}
                    type="button"
                    value={'Add word'}
                >
                    Add word
                </button>
            </div>
        </div>
    );
};

export default AddWord;