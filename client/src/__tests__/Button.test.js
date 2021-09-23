import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';

import { Button } from '../components/general/Button';
import React from 'react';

describe('Button', () => {
    it('renders', () => {
        render(<Button text="test" />);
        expect(screen.getByText('test'));
    });
});
