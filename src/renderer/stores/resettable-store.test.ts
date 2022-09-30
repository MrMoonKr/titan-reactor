import { describe, it } from "@jest/globals";
import { createResettableStore } from "./resettable-store";

describe("SessionStore", () => {

    it("should create store", () => {

        const initialState = {

            foo: "bar"

        }

        const store = createResettableStore({ initialState });

        expect(store.getState()).toStrictEqual({ "foo": "bar" });

    });

    it("should get value at path", () => {

        const initialState = {

            foo: "bar"

        };
        const store = createResettableStore({ initialState });

        expect(store.getValue(["foo"])).toBe("bar");

    });

    it("should set value at path", () => {

        const initialState = {

            foo: "bar"

        }
        const store = createResettableStore({ initialState });

        expect(store.setValue(["foo"], "baz"));

        expect(store.getValue(["foo"])).toBe("baz");

    });

    it("should merge", () => {

        const initialState = {

            foo: "bar"

        }
        const store = createResettableStore({ initialState });

        expect(store.merge({ foo: "baz" }));

        expect(store.getValue(["foo"])).toBe("baz");

    });

    it("should merge deep", () => {

        const initialState = {
            foo: {
                bar: "baz"
            }
        };
        const store = createResettableStore({ initialState });

        expect(store.merge({ foo: { bar: "foo" } }));

        expect(store.getValue(["foo", "bar"])).toBe("foo");

    });

    it("should merge if validate is true", () => {

        const initialState = {

            foo: "bar"

        };
        const store = createResettableStore({
            initialState,
            validateMerge: () => true
        });

        expect(store.merge({ foo: "baz" }));

        expect(store.getValue(["foo"])).toBe("baz");

    });

    it("should not merge if validate is false", () => {

        const initialState = {

            foo: "bar"

        }
        const store = createResettableStore({
            initialState,
            validateMerge: () => false
        });

        expect(store.merge({ foo: "baz" }));

        expect(store.getValue(["foo"])).toBe("bar");

    });

});
