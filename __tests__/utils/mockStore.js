import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

// For redux-thunk v3.x, we need to handle it differently
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

export default mockStore;

describe('mockStore', () => {
  it('should be defined', () => {
    expect(mockStore).toBeDefined();
  });
});