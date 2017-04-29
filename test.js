/**
 * Created by maximov on 29.04.17.
 */
try {
    var bb = JSON.parse('df"{');
} catch (e) {
    var bb = 'fail';
}
console.log('lg',bb);